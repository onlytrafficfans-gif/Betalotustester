// builderStore — Central state management for LOTUS App Builder
import { create } from 'zustand';
import type { AppSchema } from '@/lib/builder/appSchema';
import type { Project } from '@/lib/supabase/projectStorage';
import { loadProjects, createProject, updateProject, deleteProject, generateId } from '@/lib/supabase/projectStorage';
import { registerProvider, unregisterProvider, listProviders, getProvider, getDefaultProviderId } from '@/lib/ai/provider';
import { createGenericProvider } from '@/lib/ai/genericProvider';
import { addProvider, loadStoredProviders, type StoredProvider } from '@/lib/ai/apiKeyStorage';
import { sendMessage as aiSendMessage } from '@/lib/ai/messageHandler';

export type PreviewDevice = 'phone' | 'tablet' | 'desktop';
export type MobileTab = 'chat' | 'preview' | 'skills' | 'projects' | 'settings';
export type SidebarView = 'projects' | 'settings' | null;
export type GenerationStatus = 'idle' | 'loading' | 'success' | 'failed';

export interface ChatMessage { id: string; role: 'user' | 'assistant'; content: string; timestamp: number; images?: string[]; }

interface AppliedChange { text: string; type: string; }

interface BuilderState {
  // Data
  projects: Project[];
  project: Project | null;
  schema: AppSchema | null;
  messages: ChatMessage[];

  // UI State
  previewDevice: PreviewDevice;
  mobileTab: MobileTab;
  sidebarView: SidebarView;
  isSidebarOpen: boolean;
  showSkillsPanel: boolean;
  providerId: string;

  // Generation State
  isLoading: boolean;
  isProjectsLoading: boolean;
  generationStatus: GenerationStatus;
  lastFailedPrompt: string | null;
  error: string | null;
  appliedChanges: AppliedChange[];

  // Undo/Redo
  schemaHistory: (AppSchema | null)[];
  historyIndex: number;

  // Internal
  _currentUser: { id: string; email: string; name?: string; avatar?: string } | null;

  // Actions
  loadProjects: () => Promise<void>;
  switchProject: (id: string) => void;
  createNewProject: () => Promise<void>;
  deleteProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;

  sendMessage: (content: string) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  uploadImage: (file: File) => Promise<void>;
  clearError: () => void;
  dismissChanges: () => void;

  setPreviewDevice: (device: PreviewDevice) => void;
  setActiveScreen: (screenId: string) => void;
  setMobileTab: (tab: MobileTab) => void;
  toggleSidebar: (view: SidebarView) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSkillsPanel: () => void;
  setSkillsPanel: (open: boolean) => void;

  switchProvider: (id: string) => void;
  addApiProvider: (userId: string, config: StoredProvider) => Promise<void>;
  removeApiProvider: (id: string) => void;
  refreshProviders: (userId: string) => Promise<void>;

  undo: () => void;
  redo: () => void;
  resetCurrentProject: () => void;
  migrateFromLocalStorage: () => void;
}

function deepCloneSchema(schema: AppSchema | null): AppSchema | null {
  if (!schema) return null;
  return JSON.parse(JSON.stringify(schema));
}

const schemaSnapshot = (s: AppSchema | null) => JSON.stringify(s);

export const useBuilderStore = create<BuilderState>((set, get) => ({
  projects: [],
  project: null,
  schema: null,
  messages: [],
  previewDevice: 'phone',
  mobileTab: 'chat',
  sidebarView: null,
  isSidebarOpen: false,
  showSkillsPanel: true,
  providerId: '',
  isLoading: false,
  isProjectsLoading: false,
  generationStatus: 'idle',
  lastFailedPrompt: null,
  error: null,
  appliedChanges: [],
  schemaHistory: [null],
  historyIndex: 0,
  _currentUser: null,

  loadProjects: async () => {
    set({ isProjectsLoading: true });
    try {
      const projects = await loadProjects();
      const project = projects[0] || null;
      const defaultProvider = getDefaultProviderId();
      const schemaSnapshot = deepCloneSchema(project?.schema || null);
      set({ projects, project, messages: project?.messages || [], schema: project?.schema || null, schemaHistory: [schemaSnapshot], historyIndex: 0, generationStatus: 'idle', lastFailedPrompt: null, error: null, isProjectsLoading: false, providerId: defaultProvider, showSkillsPanel: true });
    } catch (e) {
      console.error('Failed to load projects:', e);
      set({ isProjectsLoading: false });
    }
  },

  switchProject: (id) => {
    const project = get().projects.find(p => p.id === id) || null;
    if (project) {
      set({ project, messages: project.messages || [], schema: project.schema || null, schemaHistory: [deepCloneSchema(project.schema || null)], historyIndex: 0, error: null });
    }
  },

  createNewProject: async () => {
    const newProject = await createProject('New Project');
    set(state => ({ projects: [newProject, ...state.projects], project: newProject, messages: [], schema: newProject.schema || null, schemaHistory: [deepCloneSchema(newProject.schema || null)], historyIndex: 0, error: null }));
  },

  deleteProject: async (id) => {
    await deleteProject(id);
    const projects = get().projects.filter(p => p.id !== id);
    const project = projects[0] || null;
    set({ projects, project, messages: project?.messages || [], schema: project?.schema || null, schemaHistory: [deepCloneSchema(project?.schema || null)], historyIndex: 0 });
  },

  renameProject: async (id, name) => {
    const project = get().projects.find(p => p.id === id);
    if (!project) return;
    const updated = { ...project, name, updatedAt: Date.now() };
    await updateProject(updated);
    set(state => ({ projects: state.projects.map(p => p.id === id ? updated : p), project: state.project?.id === id ? updated : state.project }));
  },

  sendMessage: async (content) => {
    const state = get();
    if (!state.project) return;
    set({ isLoading: true, generationStatus: 'loading', error: null, lastFailedPrompt: null });

    try {
      const userMessage: ChatMessage = { id: generateId(), role: 'user', content, timestamp: Date.now() };
      const updatedMessages = [...state.messages, userMessage];
      set({ messages: updatedMessages });

      const result = await aiSendMessage(content, state.schema, state.providerId);

      if (result.error) {
        set({ isLoading: false, generationStatus: 'failed', error: result.error, lastFailedPrompt: content });
        return;
      }

      const assistantMessage: ChatMessage = { id: generateId(), role: 'assistant', content: result.message, timestamp: Date.now() };
      const finalMessages = [...updatedMessages, assistantMessage];

      if (result.patches && result.patches.length > 0) {
        const newSchema = deepCloneSchema(state.schema);
        if (newSchema) {
          for (const patch of result.patches) {
            if (patch.op === 'addScreen') newSchema.screens.push(patch.screen);
            else if (patch.op === 'addComponent') {
              const screen = newSchema.screens.find(s => s.id === patch.screenId);
              if (screen) { screen.components = screen.components || []; screen.components.push(patch.component); }
            }
          }
        }
        const updatedProject = { ...state.project, schema: newSchema, messages: finalMessages, updatedAt: Date.now() };
        await updateProject(updatedProject);
        const newHistory = [...state.schemaHistory.slice(0, state.historyIndex + 1), deepCloneSchema(newSchema)];
        set({ project: updatedProject, messages: finalMessages, schema: newSchema, isLoading: false, generationStatus: 'success', appliedChanges: result.patches.map(p => ({ text: p.description || p.op, type: p.op })), schemaHistory: newHistory, historyIndex: newHistory.length - 1 });
      } else {
        const updatedProject = { ...state.project, messages: finalMessages, updatedAt: Date.now() };
        await updateProject(updatedProject);
        set({ project: updatedProject, messages: finalMessages, isLoading: false, generationStatus: 'success' });
      }
    } catch (e) {
      set({ isLoading: false, generationStatus: 'failed', error: e instanceof Error ? e.message : 'Unknown error', lastFailedPrompt: content });
    }
  },

  retryLastMessage: async () => {
    const { lastFailedPrompt } = get();
    if (lastFailedPrompt) await get().sendMessage(lastFailedPrompt);
  },

  uploadImage: async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const state = get();
        if (!state.schema || !state.project) { reject(new Error('No project')); return; }
        const newSchema = deepCloneSchema(state.schema);
        if (!newSchema) { reject(new Error('No schema')); return; }
        const imageId = generateId();
        newSchema.imageAssets = newSchema.imageAssets || [];
        newSchema.imageAssets.push({ id: imageId, name: file.name, dataUrl: base64, mimeType: file.type });
        const updatedProject = { ...state.project, schema: newSchema, updatedAt: Date.now() };
        await updateProject(updatedProject);
        set({ schema: newSchema, project: updatedProject });
        resolve(imageId);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  },

  clearError: () => set({ error: null }),
  dismissChanges: () => set({ appliedChanges: [] }),

  setPreviewDevice: (device) => set({ previewDevice: device }),
  setActiveScreen: (screenId) => {
    const state = get();
    if (state.schema) {
      const newSchema = deepCloneSchema(state.schema);
      if (newSchema) newSchema.activeScreenId = screenId;
      set({ schema: newSchema });
    }
  },
  setMobileTab: (tab) => set({ mobileTab: tab }),
  toggleSidebar: (view) => set(s => ({ sidebarView: view, isSidebarOpen: true })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleSkillsPanel: () => set(s => ({ showSkillsPanel: !s.showSkillsPanel })),
  setSkillsPanel: (open) => set({ showSkillsPanel: open }),

  switchProvider: (id) => set({ providerId: id }),
  addApiProvider: async (userId, config) => {
    await addProvider(userId, config);
    registerProvider(config.id, createGenericProvider(config.id, config.name, config.apiKey, config.baseUrl, config.model));
    set({ providerId: config.id, error: null });
  },
  removeApiProvider: (id) => {
    unregisterProvider(id);
    const providers = listProviders();
    const state = get();
    if (state.providerId === id) { const nextProvider = providers[0]; set({ providerId: nextProvider?.id || '' }); }
  },
  refreshProviders: async (userId) => {
    const stored = await loadStoredProviders(userId);
    for (const config of stored) {
      if (config.apiKey && config.apiKey.length > 10) {
        registerProvider(config.id, createGenericProvider(config.id, config.name, config.apiKey, config.baseUrl, config.model));
      }
    }
  },

  undo: () => {
    const state = get();
    if (state.historyIndex <= 0) return;
    const newIndex = state.historyIndex - 1;
    const restoredSchema = deepCloneSchema(state.schemaHistory[newIndex]);
    const updatedProject = state.project ? { ...state.project, schema: restoredSchema, updatedAt: Date.now() } : null;
    if (updatedProject) updateProject(updatedProject);
    set({ schema: restoredSchema, project: updatedProject, historyIndex: newIndex, appliedChanges: [] });
  },

  redo: () => {
    const state = get();
    if (state.historyIndex >= state.schemaHistory.length - 1) return;
    const newIndex = state.historyIndex + 1;
    const restoredSchema = deepCloneSchema(state.schemaHistory[newIndex]);
    const updatedProject = state.project ? { ...state.project, schema: restoredSchema, updatedAt: Date.now() } : null;
    if (updatedProject) updateProject(updatedProject);
    set({ schema: restoredSchema, project: updatedProject, historyIndex: newIndex, appliedChanges: [] });
  },

  resetCurrentProject: () => {
    const state = get();
    if (!state.project) return;
    const emptySchema: AppSchema = { name: 'New App', screens: [{ id: 'home', name: 'Home', title: 'Home', components: [] }], navigation: { type: 'none' }, activeScreenId: 'home', theme: { primaryColor: '#E3B26D', backgroundColor: '#0a0a0a', textColor: '#F5EDE3' }, imageAssets: [] };
    const updatedProject = { ...state.project, schema: emptySchema, messages: [], updatedAt: Date.now() };
    updateProject(updatedProject);
    set({ schema: emptySchema, project: updatedProject, messages: [], schemaHistory: [deepCloneSchema(emptySchema)], historyIndex: 0 });
  },

  migrateFromLocalStorage: () => {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('lotus_'));
      keys.forEach(k => localStorage.removeItem(k));
      set({ error: null });
    } catch { /* noop */ }
  },
}));
