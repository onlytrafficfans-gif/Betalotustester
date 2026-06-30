/**
 * Builder Store
 *
 * Zustand-based state for the app builder. Split into:
 * - Panel UI state (mobile tabs, sidebar, preview)
 * - Chat/history
 * - Projects (Supabase-backed)
 * - Providers (AI model configs)
 *
 * Persistence rules:
 * - Panel UI -> localStorage
 * - Providers -> localStorage + Supabase (if logged in)
 * - Projects -> Supabase only (if logged in), localStorage fallback
 * - Chat history -> per-project, stored in project record
 */

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import type { AppSchema } from '@/lib/builder/appSchema';
import { createEmptySchema } from '@/lib/builder/appSchema';
import type { ExportFormat } from '@/lib/builder/exportGenerator';
import { providerRegistry, defaultRegistry } from '@/lib/ai/initProviders';
import { updateProfile, getProfile } from '@/lib/supabase/profileStorage';
import { saveProject, loadUserProjects, deleteProject, type ProjectRecord } from '@/lib/supabase/projectStorage';
import { recordSkillUsage, loadUserSkills } from '@/lib/supabase/skillsStorage';
import type { Skill, PrebuiltSkill } from '@/lib/skills/skillsData';
import { skillsLibrary } from '@/lib/skills/skillsData';

export type SidebarView = 'projects' | 'settings';
export type MobileTab = 'chat' | 'preview' | 'settings';

export type PreviewDevice = 'phone' | 'tablet' | 'desktop';

export interface AIProviderConfig {
  id: string;
  name: string;
  model: string;
  apiKey: string;
}

export interface GenerationHistory {
  timestamp: number;
  prompt: string;
  changesSummary: string;
  schemaSnapshot: AppSchema;
}

interface Project {
  id: string;
  name: string;
  schema: AppSchema;
  createdAt: number;
  updatedAt: number;
  history: GenerationHistory[];
}

interface BuilderState {
  // Panel UI
  mobileTab: MobileTab;
  sidebarView: SidebarView;
  isSidebarOpen: boolean;
  showSkillsPanel: boolean;
  previewDevice: PreviewDevice;
  showPreview: boolean;

  // Chat
  messages: ChatMessage[];
  isLoading: boolean;
  streamingMessage: string;

  // Schema + History
  schema: AppSchema;
  historyIndex: number;
  history: AppSchema[];
  lastFailedPrompt: string | null;
  lastFailedMessageId: string | null;

  // Projects
  projects: Project[];
  currentProjectId: string | null;
  isProjectsLoading: boolean;
  _currentUser: { id: string; email: string; name?: string; avatar?: string } | null;

  // Providers
  providers: AIProviderConfig[];
  providerId: string;

  // Skills
  installedSkills: Skill[];
  activeSkillIds: string[];

  // UI feedback
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  generationStatus: 'idle' | 'generating' | 'applying' | 'success' | 'error';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  changesSummary?: string;
  schemaSnapshot?: AppSchema;
  isStreaming?: boolean;
  error?: string;
}

interface BuilderActions {
  setMobileTab: (tab: MobileTab) => void;
  setSidebarView: (view: SidebarView) => void;
  setSidebarOpen: (open: boolean) => void;
  setShowSkillsPanel: (show: boolean) => void;
  setPreviewDevice: (device: PreviewDevice) => void;
  setShowPreview: (show: boolean) => void;

  createProject: (name: string) => Project;
  loadProject: (id: string) => void;
  deleteProject: (id: string) => void;
  loadProjects: () => Promise<void>;
  saveCurrentProject: () => Promise<void>;
  migrateFromLocalStorage: () => Promise<number>;
  setCurrentUser: (user: { id: string; email: string; name?: string; avatar?: string } | null) => void;

  sendMessage: (content: string) => Promise<void>;
  addMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;

  updateSchema: (fn: (s: AppSchema) => AppSchema) => void;
  replaceSchema: (schema: AppSchema) => void;
  pushSchemaHistory: (schema: AppSchema) => void;
  undo: () => void;
  redo: () => void;

  addProvider: (p: AIProviderConfig) => void;
  removeProvider: (id: string) => void;
  setProviderId: (id: string) => void;
  switchProvider: (id: string) => void;
  refreshProviders: (userId: string) => Promise<void>;

  installSkill: (skill: Skill) => void;
  uninstallSkill: (id: string) => void;
  toggleSkill: (id: string) => void;
  useSkill: (id: string) => Promise<void>;

  showToast: (t: BuilderState['toast']) => void;
  clearToast: () => void;

  resetStore: () => void;
}

const currentTimestamp = () => Date.now();

const useBuilderStore = create<BuilderState & BuilderActions>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // === PANEL UI ===
        mobileTab: 'chat',
        sidebarView: 'projects',
        isSidebarOpen: true,
        showSkillsPanel: false,
        previewDevice: 'phone',
        showPreview: true,

        // === CHAT ===
        messages: [],
        isLoading: false,
        streamingMessage: '',

        // === SCHEMA + HISTORY ===
        schema: createEmptySchema(),
        historyIndex: 0,
        history: [createEmptySchema()],
        lastFailedPrompt: null,
        lastFailedMessageId: null,

        // === PROJECTS ===
        projects: [],
        currentProjectId: null,
        isProjectsLoading: false,
        _currentUser: null,

        // === PROVIDERS ===
        providers: [],
        providerId: '',

        // === SKILLS ===
        installedSkills: [],
        activeSkillIds: [],

        // === UI FEEDBACK ===
        toast: null,
        generationStatus: 'idle',

        // === PANEL UI ACTIONS ===
        setMobileTab: (tab) => set({ mobileTab: tab }),
        setSidebarView: (view) => set({ sidebarView: view }),
        setSidebarOpen: (open) => set({ isSidebarOpen: open }),
        setShowSkillsPanel: (show) => set({ showSkillsPanel: show }),
        setPreviewDevice: (device) => set({ previewDevice: device }),
        setShowPreview: (show) => set({ showPreview: show }),

        // === SET CURRENT USER ===
        setCurrentUser: (user) => {
          set({ _currentUser: user });
        },

        // === PROJECT ACTIONS ===
        createProject: (name) => {
          const schema = createEmptySchema(name);
          const project: Project = {
            id: crypto.randomUUID(),
            name,
            schema,
            createdAt: currentTimestamp(),
            updatedAt: currentTimestamp(),
            history: [],
          };
          set({
            projects: [...get().projects, project],
            currentProjectId: project.id,
            schema,
            history: [schema],
            historyIndex: 0,
            messages: [],
          });
          return project;
        },

        loadProject: (id) => {
          const project = get().projects.find((p) => p.id === id);
          if (!project) return;
          set({
            currentProjectId: id,
            schema: project.schema,
            history: [project.schema],
            historyIndex: 0,
            messages: [],
          });
        },

        deleteProject: (id) => {
          set({
            projects: get().projects.filter((p) => p.id !== id),
            currentProjectId: get().currentProjectId === id ? null : get().currentProjectId,
          });
        },

        loadProjects: async () => {
          const user = get()._currentUser;
          if (!user) return;
          set({ isProjectsLoading: true });
          try {
            await get().refreshProviders(user.id);
            const remoteProjects = await loadUserProjects(user.id);
            const localProjects = get().projects;
            const merged = [...localProjects];
            for (const rp of remoteProjects) {
              const existing = merged.find((p) => p.id === rp.id);
              if (existing) {
                existing.name = rp.name;
                existing.schema = rp.schema as AppSchema;
                existing.updatedAt = new Date(rp.updated_at).getTime();
              } else {
                merged.push({
                  id: rp.id,
                  name: rp.name,
                  schema: rp.schema as AppSchema,
                  createdAt: new Date(rp.created_at).getTime(),
                  updatedAt: new Date(rp.updated_at).getTime(),
                  history: [],
                });
              }
            }
            set({ projects: merged, isProjectsLoading: false });
          } catch (e) {
            console.error('[LOTUS] Failed to load projects:', e);
            set({ isProjectsLoading: false });
          }
        },

        saveCurrentProject: async () => {
          const state = get();
          if (!state._currentUser || !state.currentProjectId) return;
          const project = state.projects.find((p) => p.id === state.currentProjectId);
          if (!project) return;
          try {
            await saveProject(state._currentUser.id, {
              id: project.id,
              name: project.name,
              schema: project.schema,
              updated_at: new Date().toISOString(),
            });
          } catch (e) {
            console.error('[LOTUS] Failed to save project:', e);
          }
        },

        migrateFromLocalStorage: async () => {
          const keys = Object.keys(localStorage).filter((k) => k.startsWith('lotus_project_'));
          let migrated = 0;
          for (const key of keys) {
            try {
              const data = JSON.parse(localStorage.getItem(key) || '{}');
              if (data.name && data.schema) {
                get().createProject(data.name);
                migrated++;
              }
            } catch {
              // skip
            }
          }
          return migrated;
        },

        // === CHAT ACTIONS ===
        sendMessage: async (content: string) => {
          const state = get();
          if (state.isLoading) return;

          const currentProvider = state.providers.find((p) => p.id === state.providerId);
          if (!currentProvider) {
            const noProviderMsg: ChatMessage = {
              id: crypto.randomUUID(),
              role: 'system',
              content: 'No AI provider configured. Add an API key in Settings.',
              timestamp: currentTimestamp(),
            };
            set({ messages: [...state.messages, noProviderMsg] });
            return;
          }

          const userMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            content,
            timestamp: currentTimestamp(),
          };
          set({
            messages: [...get().messages, userMsg],
            isLoading: true,
            generationStatus: 'generating',
            lastFailedPrompt: null,
            lastFailedMessageId: null,
          });

          const assistantId = crypto.randomUUID();
          set({
            messages: [
              ...get().messages,
              {
                id: assistantId,
                role: 'assistant',
                content: '',
                timestamp: currentTimestamp(),
                isStreaming: true,
              },
            ],
            streamingMessage: '',
          });

          try {
            const response = await fetch(currentProvider.apiEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${currentProvider.apiKey}`,
              },
              body: JSON.stringify({
                model: currentProvider.model,
                messages: [
                  { role: 'system', content: providerRegistry.getSystemPrompt(currentProvider.model) },
                  ...get().messages
                    .filter((m) => m.role === 'user' || m.role === 'assistant')
                    .slice(-10)
                    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
                  { role: 'user', content },
                ],
                stream: true,
              }),
            });

            if (!response.ok) {
              throw new Error(`API error: ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No response body');

            let fullContent = '';
            const decoder = new TextDecoder();

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n').filter((l) => l.trim());
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') continue;
                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content || '';
                    fullContent += content;
                    set({ streamingMessage: fullContent });
                  } catch {
                    // skip parse errors in stream
                  }
                }
              }
            }

            const schemaPatch = providerRegistry.parseSchemaFromResponse(
              currentProvider.model,
              fullContent
            );

            set({ generationStatus: 'applying' });

            const currentSchema = get().schema;
            const updatedSchema = { ...currentSchema };
            if (schemaPatch.screens) {
              updatedSchema.screens = schemaPatch.screens.map(
                (s: any) => ({
                  ...s,
                  components: s.components || [],
                })
              );
            }
            if (schemaPatch.theme) {
              updatedSchema.theme = { ...currentSchema.theme, ...schemaPatch.theme };
            }
            if (schemaPatch.features) {
              updatedSchema.features = schemaPatch.features;
            }

            const changesSummary = `${schemaPatch.screens?.length || 0} screens, ${schemaPatch.features?.length || 0} features`;

            get().pushSchemaHistory(updatedSchema);

            set((s) => ({
              messages: s.messages.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      content: fullContent,
                      isStreaming: false,
                      changesSummary,
                      schemaSnapshot: updatedSchema,
                    }
                  : m
              ),
              streamingMessage: '',
              isLoading: false,
              generationStatus: 'success',
              schema: updatedSchema,
            }));

            // Persist
            const state2 = get();
            if (state2._currentUser && state2.currentProjectId) {
              await get().saveCurrentProject();
            }
          } catch (error: any) {
            console.error('[LOTUS] Generation failed:', error);
            set((s) => ({
              messages: s.messages.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      content: 'Sorry, generation failed. Please check your API key and try again.',
                      isStreaming: false,
                      error: error.message || 'Unknown error',
                    }
                  : m
              ),
              streamingMessage: '',
              isLoading: false,
              generationStatus: 'error',
              lastFailedPrompt: content,
              lastFailedMessageId: assistantId,
            }));
          }
        },

        addMessage: (msg) =>
          set({ messages: [...get().messages, msg] }),

        clearMessages: () => set({ messages: [] }),

        // === SCHEMA ACTIONS ===
        updateSchema: (fn) => {
          const newSchema = fn(get().schema);
          set({ schema: newSchema });
        },

        replaceSchema: (schema) => {
          set({ schema, history: [schema], historyIndex: 0 });
        },

        pushSchemaHistory: (schema) => {
          const state = get();
          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(schema);
          set({
            history: newHistory,
            historyIndex: newHistory.length - 1,
            schema,
          });
        },

        undo: () => {
          const state = get();
          if (state.historyIndex <= 0) return;
          const newIndex = state.historyIndex - 1;
          set({ historyIndex: newIndex, schema: state.history[newIndex] });
        },

        redo: () => {
          const state = get();
          if (state.historyIndex >= state.history.length - 1) return;
          const newIndex = state.historyIndex + 1;
          set({ historyIndex: newIndex, schema: state.history[newIndex] });
        },

        // === PROVIDER ACTIONS ===
        addProvider: (p) => {
          const providers = [...get().providers, p];
          const isFirst = providers.length === 1;
          set({
            providers,
            providerId: isFirst ? p.id : get().providerId,
          });
        },

        removeProvider: (id) => {
          const providers = get().providers.filter((p) => p.id !== id);
          set({
            providers,
            providerId: providers.length > 0 ? providers[0].id : '',
          });
        },

        setProviderId: (id) => set({ providerId: id }),

        switchProvider: (id) => set({ providerId: id }),

        refreshProviders: async (userId) => {
          try {
            const profile = await getProfile(userId);
            if (profile?.ai_providers) {
              const remoteProviders = JSON.parse(profile.ai_providers as string);
              if (Array.isArray(remoteProviders) && remoteProviders.length > 0) {
                const existing = get().providers;
                const merged = [...existing];
                for (const rp of remoteProviders) {
                  if (!merged.find((p) => p.id === rp.id)) {
                    merged.push(rp);
                  }
                }
                const newId = get().providerId || merged[0]?.id || '';
                set({ providers: merged, providerId: newId });
                return;
              }
            }
          } catch {
            // fallback to localStorage (handled by persist middleware)
          }
          const local = get().providers;
          if (local.length === 0) {
            // seed with one default provider
            set({ providers: defaultRegistry, providerId: defaultRegistry[0]?.id || '' });
          }
        },

        // === SKILL ACTIONS ===
        installSkill: (skill) => {
          const existing = get().installedSkills.find((s) => s.id === skill.id);
          if (!existing) {
            set({ installedSkills: [...get().installedSkills, skill] });
          }
        },

        uninstallSkill: (id) => {
          set({
            installedSkills: get().installedSkills.filter((s) => s.id !== id),
            activeSkillIds: get().activeSkillIds.filter((sid) => sid !== id),
          });
        },

        toggleSkill: (id) => {
          const active = get().activeSkillIds;
          if (active.includes(id)) {
            set({ activeSkillIds: active.filter((sid) => sid !== id) });
          } else {
            set({ activeSkillIds: [...active, id] });
          }
        },

        useSkill: async (id) => {
          const skill = get().installedSkills.find((s) => s.id === id);
          if (!skill) return;
          set({ isLoading: true });
          try {
            if (get()._currentUser) {
              await recordSkillUsage(get()._currentUser.id, skill.id);
            }
          } catch {
            // non-critical
          }
          await get().sendMessage(skill.systemPrompt);
          set({ isLoading: false });
        },

        // === TOAST ===
        showToast: (t) => set({ toast: t }),
        clearToast: () => set({ toast: null }),

        // === RESET ===
        resetStore: () => {
          set({
            messages: [],
            isLoading: false,
            streamingMessage: '',
            schema: createEmptySchema(),
            history: [createEmptySchema()],
            historyIndex: 0,
            currentProjectId: null,
            projects: [],
            providers: [],
            providerId: '',
            toast: null,
            generationStatus: 'idle',
            lastFailedPrompt: null,
            lastFailedMessageId: null,
          });
        },
      }),
      {
        name: 'lotus-builder',
        partialize: (state) => ({
          isSidebarOpen: state.isSidebarOpen,
          previewDevice: state.previewDevice,
          showPreview: state.showPreview,
          sidebarView: state.sidebarView,
          providers: state.providers,
          providerId: state.providerId,
          installedSkills: state.installedSkills,
          activeSkillIds: state.activeSkillIds,
          projects: state.projects,
          currentProjectId: state.currentProjectId,
          schema: state.schema,
          history: state.history,
          historyIndex: state.historyIndex,
          messages: state.messages,
        }),
      }
    )
  )
);

export { useBuilderStore };
export type { BuilderState, BuilderActions, Project, GenerationHistory };
