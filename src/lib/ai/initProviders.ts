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

export const SERVER_DEMO_PROVIDER_ID = 'groq_demo';

export const defaultRegistry: AIProviderConfig[] = [
  {
    id: SERVER_DEMO_PROVIDER_ID,
    name: 'Groq Llama 70B',
    model: 'llama-3.3-70b-versatile',
    apiKey: 'server-managed',
    apiEndpoint: 'supabase-edge',
  },
  {
    id: 'groq_oss_120b',
    name: 'Groq GPT-OSS 120B',
    model: 'openai/gpt-oss-120b',
    apiKey: 'server-managed',
    apiEndpoint: 'supabase-edge',
  },
  {
    id: 'openrouter_nemotron_super',
    name: 'Nemotron Super Free',
    model: 'nvidia/nemotron-3-super-120b-a12b:free',
    apiKey: 'server-managed',
    apiEndpoint: 'supabase-edge',
  },
];

export const providerRegistry = {
  parseSchemaFromResponse(content: string) {
    const match = content.match(/```json\s*([\s\S]*?)```/i);
    const raw = match?.[1] ?? content.match(/\{[\s\S]*\}/)?.[0];
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  },
  getSystemPrompt() {
    return [
      'You are LOTUS, a production mobile app builder.',
      'Return only valid JSON. Do not use markdown, explanations, or prose.',
      'The JSON must be an AppSchema with: name, description, screens, navigation, activeScreenId, theme, imageAssets, features.',
      'Use only supported component types: header, text, button, input, card, list, image, avatar, badge, tabs, searchBar, carousel, chart, progress, progressRing, divider, fab, bottomNav, productGrid, categoryGrid, taskList, statsRow, sectionTitle, workoutList, cartList, summary, timer, exerciseList, rating, datePicker, select, imageGallery.',
      'Every screen needs id, name, title, and components. Every component needs a type and props object.',
      'Make the app concrete and complete for the user prompt, with realistic copy and multiple useful sections.',
    ].join(' ');
  },
};
