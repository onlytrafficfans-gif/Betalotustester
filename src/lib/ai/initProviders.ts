// Initialize all available AI providers at runtime
// Loads providers from stored API keys (added via Settings panel)
// REQUIRES userId — call after auth is established

import { loadStoredProviders } from './apiKeyStorage';
import type { AIProviderConfig } from '@/state/builderStore';

export async function initProviders(userId?: string): Promise<void> {
  if (!userId) return;
  const stored = await loadStoredProviders(userId);
  localStorage.setItem('lotus_provider_count', String(stored.length));
}

export const SERVER_DEMO_PROVIDER_ID = 'openrouter_demo';

export const defaultRegistry: AIProviderConfig[] = [
  {
    id: SERVER_DEMO_PROVIDER_ID,
    name: 'LOTUS Demo AI',
    model: 'google/gemini-2.0-flash-exp:free',
    apiKey: 'server-managed',
    apiEndpoint: 'supabase-edge',
  },
  {
    id: 'groq_demo',
    name: 'LOTUS Groq',
    model: 'llama-3.3-70b-versatile',
    apiKey: 'server-managed',
    apiEndpoint: 'supabase-edge',
  },
  {
    id: 'openai_demo',
    name: 'LOTUS OpenAI',
    model: 'gpt-4o-mini',
    apiKey: 'server-managed',
    apiEndpoint: 'supabase-edge',
  },
  {
    id: 'gemini_demo',
    name: 'LOTUS Gemini',
    model: 'gemini-2.0-flash',
    apiKey: 'server-managed',
    apiEndpoint: 'supabase-edge',
  },
  {
    id: 'mock',
    name: 'Demo Mock',
    model: 'mock-dev',
    apiKey: 'mock',
    apiEndpoint: '',
  },
];

export const providerRegistry = {
  getSystemPrompt() {
    return 'You are LOTUS, an app builder. Return app schemas as JSON when changing the preview.';
  },
  parseSchemaFromResponse(content: string) {
    const match = content.match(/```json\s*([\s\S]*?)```/i);
    if (!match) return {};
    try {
      return JSON.parse(match[1]);
    } catch {
      return {};
    }
  },
};
