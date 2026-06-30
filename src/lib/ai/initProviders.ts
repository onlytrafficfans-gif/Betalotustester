// Initialize all available AI providers at runtime
// Loads providers from stored API keys (added via Settings panel)
// REQUIRES userId — call after auth is established

import { registerProvider } from './provider';
import { createGenericProvider } from './genericProvider';
import { loadStoredProviders } from './apiKeyStorage';

export async function initProviders(userId?: string): Promise<void> {
  if (!userId) return;
  const stored = await loadStoredProviders(userId);
  for (const config of stored) {
    if (config.apiKey && config.apiKey.length > 10) {
      registerProvider(config.id, createGenericProvider(config.id, config.name, config.apiKey, config.baseUrl, config.model));
    }
  }
}
