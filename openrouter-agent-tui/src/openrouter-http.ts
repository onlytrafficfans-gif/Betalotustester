import type { AgentConfig } from "./config.js";

export type OpenRouterModel = {
  id: string;
  name?: string;
  pricing?: {
    prompt?: string;
    completion?: string;
  };
};

export type ChatMessage = {
  role: "system" | "user" | "assistant" | "developer";
  content: string;
};

export function appHeaders(config: AgentConfig): Record<string, string> {
  return {
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": config.referer || "http://localhost:8787",
    "X-OpenRouter-Title": config.title || "OpenRouter Agent TUI"
  };
}

export async function fetchModels(config: AgentConfig): Promise<OpenRouterModel[]> {
  const response = await fetch("https://openrouter.ai/api/v1/models", {
    headers: appHeaders(config)
  });
  if (!response.ok) {
    throw new Error(`OpenRouter models check failed: ${response.status} ${await response.text()}`);
  }
  const body = (await response.json()) as { data?: OpenRouterModel[] };
  return body.data || [];
}

export async function chatCompletion(
  config: AgentConfig,
  prompt: string,
  model = config.model
): Promise<string> {
  return chatCompletionWithMessages(config, [{ role: "user", content: prompt }], model);
}

export async function chatCompletionWithMessages(
  config: AgentConfig,
  messages: ChatMessage[],
  model = config.model
): Promise<string> {
  const response = await rawChatCompletion(config, messages, model);
  return response.choices?.[0]?.message?.content?.trim() || "";
}

export async function rawChatCompletion(
  config: AgentConfig,
  messages: ChatMessage[],
  model = config.model
) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: appHeaders(config),
    body: JSON.stringify({
      model,
      messages
    })
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`OpenRouter chat check failed: ${response.status} ${text}`);
  }
  return JSON.parse(text) as {
    id?: string;
    model?: string;
    choices?: Array<{ message?: { role?: string; content?: string } }>;
    usage?: unknown;
  };
}
