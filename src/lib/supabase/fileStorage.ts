// File Asset Storage — Supabase-backed
import { supabase } from './client';

export interface UserFile {
  id: string; name: string; content: string | null;
  size: number; type: string; created_at: string;
}

interface DbUserFile {
  id: string; user_id: string; name: string;
  content: string | null; size: number; type: string; created_at: string;
}

function dbToUserFile(row: DbUserFile): UserFile {
  return { id: row.id, name: row.name, content: row.content, size: row.size, type: row.type, created_at: row.created_at };
}

export async function loadUserFiles(userId: string): Promise<UserFile[]> {
  if (!userId) return [];
  const { data, error } = await supabase.from('user_files').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) { console.error('loadUserFiles error:', error); return []; }
  return (data || []).map(dbToUserFile);
}

export async function saveUserFile(userId: string, name: string, content: string, size: number, type: string): Promise<UserFile | null> {
  if (!userId) return null;
  const { data, error } = await supabase.from('user_files').insert({ user_id: userId, name, content: content.slice(0, 5000), size, type }).select().single();
  if (error) { console.error('saveUserFile error:', error); return null; }
  return dbToUserFile(data as DbUserFile);
}

export async function deleteUserFile(userId: string, id: string): Promise<void> {
  if (!userId) return;
  const { error } = await supabase.from('user_files').delete().eq('id', id).eq('user_id', userId);
  if (error) console.error('deleteUserFile error:', error);
}
