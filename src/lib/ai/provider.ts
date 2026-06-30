/**
 * AI Provider System
 * 
 * Manages AI provider selection, API key storage, and message routing.
 * Supports multiple providers: OpenAI, Groq, and a mock provider for development.
 */

import { OpenAIProvider } from "./openaiProvider";
import { GroqProvider } from "./groqProvider";
import { MockProvider } from "./mockProvider";
import { AIProvider, AIRequest, AIResponse } from "./genericProvider";
import { getApiKey, setApiKey } from "./apiKeyStorage";

export type ProviderType = "openai" | "groq" | "mock";

interface ProviderEntry {
  name: string;
  type: ProviderType;
  instance: AIProvider | null;
  models: string[];
}

const providers: Record<ProviderType, ProviderEntry> = {
  openai: {
    name: "OpenAI",
    type: "openai",
    instance: null,
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
  },
  groq: {
    name: "Groq",
    type: "groq",
    instance: null,
    models: [
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "mixtral-8x7b-32768",
      "gemma2-9b-it",
    ],
  },
  mock: {
    name: "Mock (Dev)",
    type: "mock",
    instance: null,
    models: ["mock-dev"],
  },
};

let currentProvider: ProviderType = "mock";

/**
 * Initialize a provider with an API key
 */
export function initializeProvider(
  type: ProviderType,
  apiKey: string
): void {
  setApiKey(type, apiKey);

  switch (type) {
    case "openai":
      providers.openai.instance = new OpenAIProvider(apiKey);
      break;
    case "groq":
      providers.groq.instance = new GroqProvider(apiKey);
      break;
    case "mock":
      providers.mock.instance = new MockProvider();
      break;
  }
}

/**
 * Set the current active provider
 */
export function setProvider(type: ProviderType): void {
  currentProvider = type;

  // Auto-initialize mock provider
  if (type === "mock" && !providers.mock.instance) {
    providers.mock.instance = new MockProvider();
  }

  // Try to initialize from stored API key
  const apiKey = getApiKey(type);
  if (apiKey && !providers[type].instance) {
    initializeProvider(type, apiKey);
  }
}

/**
 * Get the current active provider
 */
export function getCurrentProvider(): ProviderType {
  return currentProvider;
}

/**
 * Get provider info
 */
export function getProviderInfo(type: ProviderType) {
  return {
    name: providers[type].name,
    type: providers[type].type,
    models: providers[type].models,
  };
}

/**
 * Get all available providers
 */
export function getAvailableProviders() {
  return Object.values(providers).map((p) => ({
    name: p.name,
    type: p.type,
    models: p.models,
  }));
}

/**
 * Check if a provider is ready (has API key set)
 */
export function isProviderReady(type: ProviderType): boolean {
  if (type === "mock") return true;
  return !!getApiKey(type);
}

/**
 * Send a message to the current provider
 */
export async function sendMessage(request: AIRequest): Promise<AIResponse> {
  const provider = providers[currentProvider];

  if (!provider.instance) {
    // Auto-initialize mock or try to load from storage
    if (currentProvider === "mock") {
      provider.instance = new MockProvider();
    } else {
      const apiKey = getApiKey(currentProvider);
      if (apiKey) {
        initializeProvider(currentProvider, apiKey);
      } else {
        throw new Error(
          `Provider ${provider.name} is not initialized. Please set an API key.`
        );
      }
    }
  }

  if (!provider.instance) {
    throw new Error(`Failed to initialize provider ${provider.name}`);
  }

  return provider.instance.sendMessage(request);
}

/**
 * Stream a message from the current provider
 */
export async function streamMessage(
  request: AIRequest,
  onChunk: (chunk: string) => void
): Promise<AIResponse> {
  const provider = providers[currentProvider];

  if (!provider.instance) {
    if (currentProvider === "mock") {
      provider.instance = new MockProvider();
    } else {
      const apiKey = getApiKey(currentProvider);
      if (apiKey) {
        initializeProvider(currentProvider, apiKey);
      } else {
        throw new Error(
          `Provider ${provider.name} is not initialized. Please set an API key.`
        );
      }
    }
  }

  if (!provider.instance) {
    throw new Error(`Failed to initialize provider ${provider.name}`);
  }

  if (!provider.instance.streamMessage) {
    // Fallback to non-streaming
    const response = await provider.instance.sendMessage(request);
    onChunk(response.content);
    return response;
  }

  return provider.instance.streamMessage(request, onChunk);
}

/**
 * Auto-initialize providers from stored API keys
 */
export function autoInitializeProviders(): void {
  (Object.keys(providers) as ProviderType[]).forEach((type) => {
    const apiKey = getApiKey(type);
    if (apiKey && type !== "mock") {
      initializeProvider(type, apiKey);
    }
  });

  // Always have mock ready
  if (!providers.mock.instance) {
    providers.mock.instance = new MockProvider();
  }
}

/**
 * Get the system prompt for the app builder
 */
export function getBuilderSystemPrompt(): string {
  return `You are LOTUS, an expert AI app builder. Your job is to help users create beautiful, functional mobile apps through conversation.

When a user asks you to build an app:
1. Ask clarifying questions if needed (target audience, key features, design style)
2. Generate a complete app schema in JSON format wrapped in \`\`\`json code blocks
3. Explain what you've built and suggest improvements

The app schema should include:
- name: App name
- description: Brief description
- screens: Array of screens with components
- theme: Colors and styling
- features: Special capabilities

Available component types:
- header: Navigation header with title
- text: Text content (title, subtitle, body, caption)
- button: Action buttons (primary, secondary, outline, ghost)
- input: Text input fields
- card: Content cards with image, title, description
- list: Scrollable lists
- image: Image display
- avatar: User avatars
- badge: Status badges
- tabs: Tab navigation
- searchBar: Search input
- carousel: Image carousel
- chart: Data visualization
- progress: Progress bars and rings
- divider: Section dividers
- fab: Floating action button
- bottomNav: Bottom navigation bar

Design principles:
- Mobile-first design (375px base)
- Touch-friendly (min 44px tap targets)
- Clear visual hierarchy
- Consistent spacing
- Accessible color contrast

Always wrap your JSON schema in \`\`\`json code blocks for proper parsing.`;
}

// Auto-initialize on module load
autoInitializeProviders();
