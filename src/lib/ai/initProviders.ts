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

export const defaultRegistry: AIProviderConfig[] = [
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
