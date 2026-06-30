// Project storage — Supabase-backed
import { supabase } from './client';
import type { AppSchema } from '@/lib/builder/appSchema';
import type { ChatMessage } from '@/state/builderStore';

export interface Project {
  id: string;
  name: string;
  schema: AppSchema | null;
  messages: ChatMessage[];
  updatedAt: number;
  createdAt: number;
}

export interface ProjectRecord {
  id: string;
  name: string;
  schema: AppSchema | null;
  messages?: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function dbToProject(row: any): Project {
  return {
    id: row.id,
    name: row.name,
    schema: row.schema,
    messages: row.messages || [],
    updatedAt: new Date(row.updated_at).getTime(),
    createdAt: new Date(row.created_at).getTime(),
  };
}

export async function loadProjects(): Promise<Project[]> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return [getDefaultProject()];
    const userId = session.session.user.id;
    const { data, error } = await supabase.from('projects').select('*').eq('user_id', userId).order('updated_at', { ascending: false });
    if (error) { console.error('loadProjects error:', error); return [getDefaultProject()]; }
    if (!data || data.length === 0) return [getDefaultProject()];
    return data.map(dbToProject);
  } catch (error) {
    console.error('loadProjects exception:', error);
    return [getDefaultProject()];
  }
}

export async function loadUserProjects(userId: string): Promise<ProjectRecord[]> {
  if (!userId) return [];
  const { data, error } = await supabase.from('projects').select('*').eq('user_id', userId).order('updated_at', { ascending: false });
  if (error) {
    console.error('loadUserProjects error:', error);
    return [];
  }
  return (data || []) as ProjectRecord[];
}

export async function saveProject(userId: string, project: Pick<ProjectRecord, 'id' | 'name' | 'schema'> & { updated_at?: string }): Promise<void> {
  if (!userId) return;
  const payload = {
    id: project.id,
    user_id: userId,
    name: project.name,
    schema: project.schema,
    updated_at: project.updated_at || new Date().toISOString(),
  };
  const { error } = await supabase.from('projects').upsert(payload);
  if (error) throw error;
}

export async function createProject(name: string): Promise<Project> {
  const project: Project = { id: generateId(), name, schema: getDefaultSchema(), messages: [], updatedAt: Date.now(), createdAt: Date.now() };
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user.id;
    if (userId) {
      const { error } = await supabase.from('projects').insert({ id: project.id, user_id: userId, name: project.name, schema: project.schema, messages: project.messages });
      if (error) console.error('createProject error:', error);
    }
  } catch (error) {
    console.error('createProject exception:', error);
  }
  return project;
}

export async function updateProject(project: Project): Promise<void> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;
    const { error } = await supabase.from('projects').update({ name: project.name, schema: project.schema, messages: project.messages, updated_at: new Date().toISOString() }).eq('id', project.id);
    if (error) console.error('updateProject error:', error);
  } catch (error) {
    console.error('updateProject exception:', error);
  }
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
}

function getDefaultProject(): Project {
  return { id: 'default', name: 'Welcome Project', schema: getDefaultSchema(), messages: [], updatedAt: Date.now(), createdAt: Date.now() };
}

function getDefaultSchema(): AppSchema {
  return { name: 'New App', screens: [{ id: 'home', name: 'Home', title: 'Home', components: [] }], navigation: { type: 'none' }, activeScreenId: 'home', theme: { primaryColor: '#E3B26D', backgroundColor: '#0a0a0a', textColor: '#F5EDE3' }, imageAssets: [], features: [] };
}
