import "dotenv/config";
import path from "node:path";
import process from "node:process";

export const FREE_MODELS = [
  "openai/gpt-oss-20b:free",
  "qwen/qwen3-coder:free",
  "openai/gpt-oss-120b:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "poolside/laguna-m.1:free"
] as const;

export type AgentConfig = {
  apiKey: string;
  referer?: string;
  title?: string;
  model: string;
  maxSteps: number;
  maxCostUsd: number;
  cwd: string;
  sessionDir: string;
};

export function loadConfig(): AgentConfig {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is missing. Add it to .env or your shell environment.");
  }

  return {
    apiKey,
    referer: process.env.OPENROUTER_REFERER?.trim() || "https://lotus-openrouter-agent.onrender.com",
    title: process.env.OPENROUTER_TITLE?.trim() || "Lotus OpenRouter Agent",
    model: process.env.AGENT_MODEL?.trim() || "@preset/lotus",
    maxSteps: Number(process.env.AGENT_MAX_STEPS || 16),
    maxCostUsd: Number(process.env.AGENT_MAX_COST_USD || 0.25),
    cwd: process.cwd(),
    sessionDir: path.join(process.cwd(), ".sessions")
  };
}

export function modelFallbacks(primaryModel: string): string[] {
  if (primaryModel.startsWith("@preset/")) return [primaryModel];

  return [primaryModel, ...FREE_MODELS].filter((model, index, models) => {
    return model.trim().length > 0 && models.indexOf(model) === index;
  }).slice(0, 3);
}

export function shouldSendFallbackModels(model: string): boolean {
  return !model.startsWith("@preset/");
}

export const SYSTEM_INSTRUCTIONS = `You are a focused local coding agent running inside a terminal TUI.
Build real working software, inspect files before editing, keep changes scoped, and explain what you changed.
Use tools when they provide better evidence than guessing. Never print secrets. Prefer concrete implementation over generic advice.
When using shell commands, choose safe read/build/test commands first and avoid destructive actions unless the user explicitly asked.`;
