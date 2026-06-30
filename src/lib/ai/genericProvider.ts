/**
 * Generic AI Provider
 * 
 * Provides a unified interface for different AI providers (OpenAI, Anthropic, Groq).
 * Handles model routing, request formatting, and response parsing.
 */

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIRequest {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

export interface AIProvider {
  name: string;
  models: string[];
  sendMessage(request: AIRequest): Promise<AIResponse>;
  streamMessage?(
    request: AIRequest,
    onChunk: (chunk: string) => void
  ): Promise<AIResponse>;
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  name: string;
  apiKey: string;
  baseUrl?: string;
  defaultModel: string;
  availableModels: string[];
}

/**
 * Create a generic provider from configuration
 */
export function createProvider(config: ProviderConfig): AIProvider {
  return {
    name: config.name,
    models: config.availableModels,
    sendMessage: async (request: AIRequest): Promise<AIResponse> => {
      throw new Error(`Provider ${config.name} not implemented`);
    },
  };
}

/**
 * Format messages for different providers
 */
export function formatMessages(
  messages: AIMessage[],
  provider: string
): Array<{ role: string; content: string }> {
  switch (provider) {
    case "anthropic":
      // Anthropic uses a different message format
      return messages.map((m) => ({
        role: m.role === "system" ? "user" : m.role,
        content: m.content,
      }));
    default:
      return messages;
  }
}

/**
 * Parse streaming response chunk
 */
export function parseStreamChunk(
  chunk: string,
  provider: string
): string {
  try {
    const lines = chunk.split("\n").filter((line) => line.trim());
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") return "";
        const parsed = JSON.parse(data);
        return parsed.choices?.[0]?.delta?.content || "";
      }
    }
  } catch {
    // Ignore parse errors
  }
  return "";
}
