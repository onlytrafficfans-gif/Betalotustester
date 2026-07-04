import { OpenRouter } from "@openrouter/sdk";
import type { AgentConfig } from "./config.js";

export const LOTUS_PRESET = "@preset/lotus";
export const LOTUS_PRESET_SLUG = "lotus";

export const REPAIRED_LOTUS_MODELS = [
  "openai/gpt-oss-20b:free",
  "google/gemma-4-26b-a4b-it:free",
  "poolside/laguna-m.1:free"
] as const;

export function createOpenRouterClient(config: AgentConfig): OpenRouter {
  return new OpenRouter({
    apiKey: config.apiKey,
    httpReferer: config.referer,
    appTitle: config.title
  });
}

export function presetModels(preset: unknown): string[] {
  const data = preset as {
    data?: {
      designatedVersion?: {
        config?: {
          models?: string[];
        } | null;
      } | null;
    };
  };
  return data.data?.designatedVersion?.config?.models || [];
}
