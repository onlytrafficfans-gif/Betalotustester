import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import type { AppSchema } from '@/lib/builder/appSchema';
import { createEmptySchema, mergeSchemaUpdates } from '@/lib/builder/appSchema';
import { SERVER_DEMO_PROVIDER_ID, defaultRegistry, providerRegistry } from '@/lib/ai/initProviders';
import { loadStoredProviders } from '@/lib/ai/apiKeyStorage';
import { proxyAIRequest } from '@/lib/ai/backendProxy';
import { loadUserProjects, saveProject, deleteProject as deleteStoredProject } from '@/lib/supabase/projectStorage';
import { recordSkillUsage } from '@/lib/supabase/skillsStorage';
import type { Skill } from '@/lib/skills/skillsData';

export type SidebarView = 'projects' | 'settings';
export type MobileTab = 'home' | 'projects' | 'builder' | 'preview' | 'menu';
export type PreviewDevice = 'phone' | 'tablet' | 'desktop';
export type BuilderOverlay = null | 'projects' | 'settings' | 'skills' | 'integrations' | 'quickActions';

export interface AIProviderConfig {
  id: string;
  name: string;
  model: string;
  apiKey: string;
  apiEndpoint: string;
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

interface CurrentUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

interface BuilderState {
  mobileTab: MobileTab;
  activePanel: string;
  sidebarView: SidebarView;
  isSidebarOpen: boolean;
  activeOverlay: BuilderOverlay;
  isToolsOpen: boolean;
  showSkillsPanel: boolean;
  previewDevice: PreviewDevice;
  showPreview: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  streamingMessage: string;
  error: string | null;
  appliedChanges: Array<{ text: string }>;
  schema: AppSchema;
  historyIndex: number;
  history: AppSchema[];
  schemaHistory: AppSchema[];
  lastFailedPrompt: string | null;
  lastFailedMessageId: string | null;
  projects: Project[];
  project: Project | null;
  currentProjectId: string | null;
  isProjectsLoading: boolean;
  _currentUser: CurrentUser | null;
  providers: AIProviderConfig[];
  providerId: string;
  selectedProvider: string;
  apiKeys: Record<string, string>;
  theme: 'dark' | 'light';
  exportFormat: string;
  installedSkills: Skill[];
  activeSkillIds: string[];
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  generationStatus: 'idle' | 'generating' | 'applying' | 'success' | 'error';
}

interface BuilderActions {
  setMobileTab: (tab: MobileTab) => void;
  setSidebarView: (view: SidebarView) => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveOverlay: (overlay: BuilderOverlay) => void;
  closeOverlay: () => void;
  setToolsOpen: (open: boolean) => void;
  setShowSkillsPanel: (show: boolean) => void;
  toggleSkillsPanel: () => void;
  setPreviewDevice: (device: PreviewDevice) => void;
  setShowPreview: (show: boolean) => void;
  togglePreview: () => void;
  setActivePanel: (panel: string) => void;
  toggleSidebar: () => void;
  setCurrentUser: (user: CurrentUser | null) => void;
  setCurrentProject: (project: Project) => void;
  clearProject: () => void;
  addProject: (project: Project) => void;
  removeProject: (id: string) => void;
  createProject: (name: string) => Project;
  createNewProject: (name?: string) => Project;
  loadProject: (id: string) => void;
  switchProject: (id: string) => void;
  deleteProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
  loadProjects: () => Promise<void>;
  saveCurrentProject: () => Promise<void>;
  migrateFromLocalStorage: () => Promise<number>;
  sendMessage: (content: string) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  addMessage: (msg: Omit<ChatMessage, 'id'> & { id?: string }) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  dismissChanges: () => void;
  updateSchema: (fn: ((s: AppSchema) => AppSchema) | AppSchema) => void;
  replaceSchema: (schema: AppSchema) => void;
  pushSchemaHistory: (schema: AppSchema) => void;
  setActiveScreen: (screenId: string) => void;
  undo: () => void;
  redo: () => void;
  resetCurrentProject: () => void;
  addProvider: (p: AIProviderConfig) => void;
  addApiProvider: (userId: string, p: { id: string; name: string; apiKey: string; baseUrl: string; model: string }) => Promise<void>;
  removeProvider: (id: string) => void;
  setProviderId: (id: string) => void;
  setProvider: (id: string) => void;
  setApiKey: (id: string, apiKey: string) => void;
  switchProvider: (id: string) => void;
  refreshProviders: (userId: string) => Promise<void>;
  installSkill: (skill: Skill) => void;
  uninstallSkill: (id: string) => void;
  toggleSkill: (id: string) => void;
  useSkill: (id: string) => Promise<void>;
  uploadImage: (file: File) => Promise<void>;
  showToast: (t: BuilderState['toast']) => void;
  clearToast: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setExportFormat: (format: string) => void;
  resetStore: () => void;
}

const now = () => Date.now();
const newId = () => (typeof globalThis.crypto?.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).slice(2));

function makeProject(name: string): Project {
  const schema = createEmptySchema(name);
  return { id: newId(), name, schema, createdAt: now(), updatedAt: now(), history: [] };
}

function withProjectSchema(project: Project | null, schema: AppSchema): Project | null {
  return project ? { ...project, schema, updatedAt: now() } : null;
}

function extractSchema(content: string, fallbackName: string): AppSchema {
  const patch = providerRegistry.parseSchemaFromResponse(content) as Partial<AppSchema>;
  return mergeSchemaUpdates(createEmptySchema(fallbackName), patch);
}

const initialSchema = createEmptySchema();
const fallbackProviderId = SERVER_DEMO_PROVIDER_ID;

const useBuilderStore = create<BuilderState & BuilderActions>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        mobileTab: 'home',
        activePanel: 'home',
        sidebarView: 'projects',
        isSidebarOpen: true,
        activeOverlay: null,
        isToolsOpen: false,
        
        showSkillsPanel: false,
        previewDevice: 'phone',
        showPreview: true,
        messages: [],
        isLoading: false,
        streamingMessage: '',
        error: null,
        appliedChanges: [],
        schema: initialSchema,
        historyIndex: 0,
        history: [initialSchema],
        schemaHistory: [initialSchema],
        lastFailedPrompt: null,
        lastFailedMessageId: null,
        projects: [],
        project: null,
        
        currentProjectId: null,
        isProjectsLoading: false,
        _currentUser: null,
        providers: defaultRegistry,
        providerId: fallbackProviderId,
        selectedProvider: fallbackProviderId,
        apiKeys: {},
        theme: 'dark',
        exportFormat: 'pwa',
        installedSkills: [],
        activeSkillIds: [],
        toast: null,
        generationStatus: 'idle',

        setMobileTab: (tab) => {
          set({ mobileTab: tab, activePanel: tab, activeOverlay: null });
        },
        setSidebarView: (view) => set({ sidebarView: view }),
        setSidebarOpen: (open) => set({ isSidebarOpen: open }),
        setActiveOverlay: (activeOverlay) => set({ activeOverlay, showSkillsPanel: activeOverlay === 'skills' }),
        closeOverlay: () => set({ activeOverlay: null, showSkillsPanel: false, isToolsOpen: false }),
        setToolsOpen: (isToolsOpen) => set({ isToolsOpen }),
        setShowSkillsPanel: (show) => set({ showSkillsPanel: show, activeOverlay: show ? 'skills' : null }),
        toggleSkillsPanel: () => {
          const next = !get().showSkillsPanel;
          set({ showSkillsPanel: next, activeOverlay: next ? 'skills' : null });
        },
        setPreviewDevice: (device) => set({ previewDevice: device }),
        setShowPreview: (show) => set({ showPreview: show }),
        togglePreview: () => set({ showPreview: !get().showPreview }),
        setActivePanel: (panel) => set({ activePanel: panel, mobileTab: ['home', 'projects', 'builder', 'preview', 'menu'].includes(panel) ? panel as MobileTab : get().mobileTab }),
        toggleSidebar: () => set({ isSidebarOpen: !get().isSidebarOpen }),
        setCurrentUser: (user) => set({ _currentUser: user }),
        setCurrentProject: (incoming) => {
          const project: Project = {
            id: incoming.id ?? newId(),
            name: incoming.name ?? 'Untitled App',
            schema: incoming.schema as AppSchema,
            createdAt: typeof incoming.createdAt === 'number' ? incoming.createdAt : new Date(incoming.createdAt ?? Date.now()).getTime(),
            updatedAt: typeof incoming.updatedAt === 'number' ? incoming.updatedAt : new Date(incoming.updatedAt ?? Date.now()).getTime(),
            history: incoming.history ?? [],
          };
          set({ project, currentProjectId: project.id, schema: project.schema });
        },
        clearProject: () => set({ project: null, currentProjectId: null }),
        addProject: (incoming) => {
          const project: Project = {
            id: incoming.id ?? newId(),
            name: incoming.name ?? 'Untitled App',
            schema: incoming.schema as AppSchema,
            createdAt: typeof incoming.createdAt === 'number' ? incoming.createdAt : new Date(incoming.createdAt ?? Date.now()).getTime(),
            updatedAt: typeof incoming.updatedAt === 'number' ? incoming.updatedAt : new Date(incoming.updatedAt ?? Date.now()).getTime(),
            history: incoming.history ?? [],
          };
          set({ projects: [...get().projects, project] });
        },
        removeProject: (id) => get().deleteProject(id),

        createProject: (name) => {
          const project = makeProject(name);
          set({
            projects: [project, ...get().projects],
            project,
            currentProjectId: project.id,
            schema: project.schema,
            history: [project.schema],
            schemaHistory: [project.schema],
            historyIndex: 0,
            messages: [],
          });
          void get().saveCurrentProject();
          return project;
        },
        createNewProject: (name = 'Untitled App') => get().createProject(name),
        loadProject: (id) => {
          const project = get().projects.find((p) => p.id === id);
          if (!project) return;
          set({ project, currentProjectId: id, schema: project.schema, history: [project.schema], schemaHistory: [project.schema], historyIndex: 0, messages: [] });
        },
        switchProject: (id) => get().loadProject(id),
        deleteProject: (id) => {
          const user = get()._currentUser;
          const projects = get().projects.filter((p) => p.id !== id);
          const project = get().currentProjectId === id ? projects[0] ?? null : get().project;
          set({ projects, project, currentProjectId: project?.id ?? null, schema: project?.schema ?? createEmptySchema() });
          if (user) void deleteStoredProject(id).catch((error) => {
            console.error('[LOTUS] Failed to delete project remotely:', error);
            set({ error: 'Project was removed locally, but remote deletion failed. Check Supabase project settings.' });
          });
        },
        renameProject: (id, name) => {
          const trimmed = name.trim();
          if (!trimmed) return;
          const projects = get().projects.map((p) => p.id === id ? { ...p, name: trimmed, updatedAt: now(), schema: { ...p.schema, name: trimmed } } : p);
          const project = projects.find((p) => p.id === get().currentProjectId) ?? null;
          set({ projects, project, schema: project?.schema ?? get().schema });
          void get().saveCurrentProject();
        },
        loadProjects: async () => {
          const user = get()._currentUser;
          if (!user) return;
          set({ isProjectsLoading: true });
          try {
            await get().refreshProviders(user.id);
            const remote = await loadUserProjects(user.id);
            const projects = remote.map((p) => ({
              id: p.id,
              name: p.name,
              schema: p.schema ?? createEmptySchema(p.name),
              createdAt: new Date(p.created_at).getTime(),
              updatedAt: new Date(p.updated_at).getTime(),
              history: [],
            }));
            const finalProjects = projects.length > 0 ? projects : get().projects;
            const project = get().currentProjectId ? finalProjects.find((p) => p.id === get().currentProjectId) ?? finalProjects[0] ?? null : finalProjects[0] ?? null;
            set({ projects: finalProjects, project, currentProjectId: project?.id ?? null, schema: project?.schema ?? get().schema, isProjectsLoading: false });
          } catch (error) {
            console.error('[LOTUS] Failed to load projects:', error);
            set({ isProjectsLoading: false });
          }
        },
        saveCurrentProject: async () => {
          const user = get()._currentUser;
          const project = get().project;
          if (!user || !project) return;
          try {
            await saveProject(user.id, { id: project.id, name: project.name, schema: project.schema });
          } catch (error) {
            console.error('[LOTUS] Failed to save project remotely:', error);
            set({ error: 'Project changes are local only. Supabase project storage could not be reached. Run supabase/migrations/001_lotus_demo_schema.sql in your Supabase project.' });
          }
        },
        migrateFromLocalStorage: async () => 0,

        sendMessage: async (content) => {
          if (get().isLoading) return;
          const userMsg: ChatMessage = { id: newId(), role: 'user', content, timestamp: now() };
          const assistantId = newId();
          set({
            messages: [...get().messages, userMsg, { id: assistantId, role: 'assistant', content: '', timestamp: now(), isStreaming: true }],
            isLoading: true,
            error: null,
            generationStatus: 'generating',
            lastFailedPrompt: null,
            lastFailedMessageId: null,
          });
          try {
            const provider = get().providers.find((p) => p.id === get().providerId) ?? defaultRegistry[0];
            let fullContent = '';
            if (provider.id === 'mock') {
              throw new Error('Demo Mock is disabled for this deployment. Configure a shared AI provider key.');
            } else if (!provider.apiEndpoint) {
              throw new Error(`Provider ${provider.name} is missing an API endpoint.`);
            } else {
              const proxyResponse = await proxyAIRequest({
                provider: provider.id,
                model: provider.model,
                messages: [
                  { role: 'system', content: providerRegistry.getSystemPrompt() },
                  { role: 'user', content },
                ],
              });
              fullContent = proxyResponse.content;
            }
            const updatedSchema = extractSchema(fullContent, get().schema.name);
            const changesSummary = `${updatedSchema.screens.length} screen${updatedSchema.screens.length === 1 ? '' : 's'} updated`;
            get().pushSchemaHistory(updatedSchema);
            set((state) => ({
              messages: state.messages.map((m) => m.id === assistantId ? { ...m, content: fullContent, isStreaming: false, changesSummary, schemaSnapshot: updatedSchema } : m),
              streamingMessage: '',
              isLoading: false,
              generationStatus: 'success',
              appliedChanges: [{ text: changesSummary }],
              project: withProjectSchema(state.project, updatedSchema),
            }));
            void get().saveCurrentProject();
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            set((state) => ({
              messages: state.messages.map((m) => m.id === assistantId ? { ...m, content: 'Generation failed. Check the shared AI provider configuration in Supabase Edge Function secrets.', isStreaming: false, error: message } : m),
              isLoading: false,
              generationStatus: 'error',
              error: message,
              lastFailedPrompt: content,
              lastFailedMessageId: assistantId,
            }));
          }
        },
        retryLastMessage: async () => {
          const prompt = get().lastFailedPrompt;
          if (prompt) await get().sendMessage(prompt);
        },
        addMessage: (msg) => set({ messages: [...get().messages, { id: msg.id ?? newId(), ...msg }] }),
        clearMessages: () => set({ messages: [] }),
        setLoading: (isLoading) => set({ isLoading }),
        clearError: () => set({ error: null }),
        setError: (error) => set({ error }),
        dismissChanges: () => set({ appliedChanges: [] }),

        updateSchema: (fn) => get().replaceSchema(typeof fn === 'function' ? fn(get().schema) : fn),
        replaceSchema: (schema) => set({ schema, project: withProjectSchema(get().project, schema), history: [schema], schemaHistory: [schema], historyIndex: 0 }),
        pushSchemaHistory: (schema) => {
          const next = get().history.slice(0, get().historyIndex + 1);
          next.push(schema);
          const project = withProjectSchema(get().project, schema);
          set({ history: next, schemaHistory: next, historyIndex: next.length - 1, schema, project });
        },
        setActiveScreen: (screenId) => set({ schema: { ...get().schema, activeScreenId: screenId } }),
        undo: () => {
          const index = get().historyIndex - 1;
          if (index < 0) return;
          set({ historyIndex: index, schema: get().history[index] });
        },
        redo: () => {
          const index = get().historyIndex + 1;
          if (index >= get().history.length) return;
          set({ historyIndex: index, schema: get().history[index] });
        },
        resetCurrentProject: () => get().replaceSchema(createEmptySchema(get().project?.name ?? 'New App')),

        addProvider: (provider) => set({ providers: [...get().providers.filter((p) => p.id !== provider.id), provider], providerId: provider.id, selectedProvider: provider.id }),
        addApiProvider: async (_userId, provider) => get().addProvider({ id: provider.id, name: provider.name, apiKey: provider.apiKey, model: provider.model, apiEndpoint: provider.baseUrl }),
        removeProvider: (id) => {
          const providers = get().providers.filter((p) => p.id !== id);
          set({ providers, providerId: providers[0]?.id ?? fallbackProviderId, selectedProvider: providers[0]?.id ?? fallbackProviderId });
        },
        setProviderId: (id) => set({ providerId: id, selectedProvider: id }),
        setProvider: (id) => set({ providerId: id, selectedProvider: id }),
        setApiKey: (id, apiKey) => set({ apiKeys: { ...get().apiKeys, [id]: apiKey } }),
        switchProvider: (id) => set({ providerId: id, selectedProvider: id }),
        refreshProviders: async (userId) => {
          try {
            const storedProviders = await loadStoredProviders(userId);
            const configuredProviders = storedProviders
              .filter((provider) => provider.apiKey && provider.apiKey.length > 10)
              .map((provider) => ({
                id: provider.id,
                name: provider.name,
                apiKey: provider.apiKey,
                model: provider.model,
                apiEndpoint: provider.baseUrl,
              }));
            const providers = [
              ...defaultRegistry,
              ...configuredProviders.filter((provider) => !defaultRegistry.some((preset) => preset.id === provider.id)),
            ];
            const providerId = providers.some((provider) => provider.id === get().providerId) ? get().providerId : fallbackProviderId;
            set({ providers, providerId, selectedProvider: providerId });
          } catch (error) {
            console.error('[LOTUS] Failed to refresh AI providers:', error);
            if (get().providers.length === 0) set({ providers: defaultRegistry, providerId: fallbackProviderId, selectedProvider: fallbackProviderId });
          }
        },

        installSkill: (skill) => set({ installedSkills: [...get().installedSkills.filter((s) => s.id !== skill.id), skill] }),
        uninstallSkill: (id) => set({ installedSkills: get().installedSkills.filter((s) => s.id !== id), activeSkillIds: get().activeSkillIds.filter((sid) => sid !== id) }),
        toggleSkill: (id) => set({ activeSkillIds: get().activeSkillIds.includes(id) ? get().activeSkillIds.filter((sid) => sid !== id) : [...get().activeSkillIds, id] }),
        useSkill: async (id) => {
          const skill = get().installedSkills.find((s) => s.id === id);
          if (!skill) return;
          const user = get()._currentUser;
          if (user) await recordSkillUsage(user.id, skill.id).catch(() => undefined);
          await get().sendMessage(skill.prompt);
        },
        uploadImage: async (file) => {
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          });
          get().replaceSchema({ ...get().schema, imageAssets: [...(get().schema.imageAssets ?? []), { id: newId(), name: file.name, dataUrl, mimeType: file.type }] });
        },
        showToast: (toast) => set({ toast }),
        clearToast: () => set({ toast: null }),
        setTheme: (theme) => set({ theme }),
        setExportFormat: (exportFormat) => set({ exportFormat }),
        resetStore: () => {
          const schema = createEmptySchema();
          set({ messages: [], isLoading: false, streamingMessage: '', error: null, appliedChanges: [], schema, history: [schema], schemaHistory: [schema], historyIndex: 0, currentProjectId: null, project: null });
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
          project: state.project,
          currentProjectId: state.currentProjectId,
          schema: state.schema,
          history: state.history,
          schemaHistory: state.schemaHistory,
          historyIndex: state.historyIndex,
          messages: state.messages,
          activePanel: state.activePanel,
          selectedProvider: state.selectedProvider,
          apiKeys: state.apiKeys,
          theme: state.theme,
          exportFormat: state.exportFormat,
          mobileTab: state.mobileTab,
        }),
      }
    )
  )
);

export { useBuilderStore };
export type { BuilderState, BuilderActions, Project };
