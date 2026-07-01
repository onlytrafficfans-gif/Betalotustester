// User profile storage (theme, hints, etc.)
import { supabase } from './client';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  theme_mode: 'dark' | 'light';
  has_seen_hints: boolean;
  created_at: string;
  updated_at: string;
}

export async function getThemeMode(userId: string): Promise<'dark' | 'light'> {
  const { data, error } = await supabase.from('user_profiles').select('theme_mode').eq('id', userId).single();
  if (error || !data) return 'dark';
  return (data.theme_mode as 'dark' | 'light') || 'dark';
}

export async function setThemeMode(userId: string, mode: 'dark' | 'light'): Promise<void> {
  await supabase.from('user_profiles').update({ theme_mode: mode, updated_at: new Date().toISOString() }).eq('id', userId);
}

export async function setHasSeenHints(userId: string): Promise<void> {
  await supabase.from('user_profiles').update({ has_seen_hints: true }).eq('id', userId);
}

export async function getProfile(userId: string): Promise<Record<string, unknown> | null> {
  const { data, error } = await supabase.from('user_profiles').select('*').eq('id', userId).single();
  if (error) return null;
  return data;
}

export async function updateProfile(userId: string, updates: Record<string, unknown>): Promise<void> {
  await supabase.from('user_profiles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', userId);
}
