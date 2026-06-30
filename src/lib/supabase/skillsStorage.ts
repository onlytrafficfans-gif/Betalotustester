// Skills Storage — Supabase-backed
import { supabase } from './client';
import type { Skill } from '@/lib/skills/skillsData';

interface DbUserSkill {
  id: string; user_id: string; name: string; type: string;
  category: string; description: string; prompt: string;
  icon: string; tags: string[]; created_at: string;
}

function dbToSkill(row: DbUserSkill): Skill {
  return { id: row.id, name: row.name, type: row.type as 'skill' | 'agent', category: row.category as any, description: row.description, prompt: row.prompt, icon: row.icon, tags: row.tags || [], isDefault: false };
}

export async function loadUserSkills(userId: string): Promise<Skill[]> {
  if (!userId) return [];
  const { data, error } = await supabase.from('user_skills').select('*').eq('user_id', userId).order('created_at', { ascending: true });
  if (error) { console.error('loadUserSkills error:', error); return []; }
  return (data || []).map(dbToSkill);
}

export async function saveUserSkill(userId: string, skill: Skill): Promise<Skill | null> {
  if (!userId) return null;
  const payload = { user_id: userId, name: skill.name, type: skill.type, category: skill.category, description: skill.description, prompt: skill.prompt, icon: skill.icon, tags: skill.tags || [] };
  const { data, error } = await supabase.from('user_skills').insert(payload).select().single();
  if (error) { console.error('saveUserSkill error:', error); return null; }
  return dbToSkill(data as DbUserSkill);
}

export async function deleteUserSkill(userId: string, id: string): Promise<void> {
  if (!userId) return;
  const { error } = await supabase.from('user_skills').delete().eq('id', id).eq('user_id', userId);
  if (error) console.error('deleteUserSkill error:', error);
}
