// API Key Storage — Dynamic provider and key management via Supabase

import { supabase } from '@/lib/supabase/client';

export interface StoredProvider {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  models: string[];
}

export const PRESET_PROVIDERS: Omit<StoredProvider, 'apiKey'>[] = [
  { id: 'openrouter', name: 'OpenRouter (Free)', baseUrl: 'https://openrouter.ai/api/v1/chat/completions', model: 'google/gemini-2.0-flash-exp:free', models: ['google/gemini-2.0-flash-exp:free', 'meta-llama/llama-3.3-70b-instruct:free', 'deepseek/deepseek-chat:free', 'mistralai/mistral-7b-instruct:free', 'qwen/qwen2.5-7b-instruct:free'] },
  { id: 'gemini', name: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', model: 'gemini-2.0-flash', models: ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash', 'gemini-1.5-pro'] },
  { id: 'groq', name: 'Groq', baseUrl: 'https://api.groq.com/openai/v1/chat/completions', model: 'llama-3.3-70b-versatile', models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it'] },
  { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-mini', models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
  { id: 'anthropic', name: 'Anthropic', baseUrl: 'https://api.anthropic.com/v1/messages', model: 'claude-3-5-sonnet-20241022', models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'] },
  { id: 'deepseek', name: 'DeepSeek', baseUrl: 'https://api.deepseek.com/chat/completions', model: 'deepseek-chat', models: ['deepseek-chat', 'deepseek-reasoner'] },
  { id: 'custom', name: 'Custom', baseUrl: 'https://api.example.com/v1/chat/completions', model: 'default', models: ['default'] },
];

async function getApiKeys(userId: string): Promise<StoredProvider[]> {
  const { data, error } = await supabase.from('user_profiles').select('api_keys').eq('id', userId).single();
  if (error || !data?.api_keys) return [];
  return (data.api_keys as StoredProvider[]) || [];
}

async function setApiKeys(userId: string, providers: StoredProvider[]): Promise<void> {
  const { error } = await supabase.from('user_profiles').update({ api_keys: providers, updated_at: new Date().toISOString() }).eq('id', userId);
  if (error) console.error('setApiKeys error:', error);
}

export async function loadStoredProviders(userId: string): Promise<StoredProvider[]> {
  if (!userId) return [];
  return getApiKeys(userId);
}

export async function addProvider(userId: string, provider: StoredProvider): Promise<void> {
  if (!userId) return;
  const providers = await getApiKeys(userId);
  const existing = providers.findIndex(p => p.id === provider.id);
  if (existing >= 0) providers[existing] = provider;
  else providers.push(provider);
  await setApiKeys(userId, providers);
}

export async function removeProvider(userId: string, id: string): Promise<void> {
  if (!userId) return;
  const providers = (await getApiKeys(userId)).filter(p => p.id !== id);
  await setApiKeys(userId, providers);
}

export function maskKey(key: string): string {
  if (!key || key.length <= 12) return '****';
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

export function getApiKey(providerId: string): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(`lotus_api_key_${providerId}`);
}

export function setApiKey(providerId: string, apiKey: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(`lotus_api_key_${providerId}`, apiKey);
}
