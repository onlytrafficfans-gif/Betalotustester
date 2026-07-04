import { colors } from "./terminal-bg.js";

type ToolEventLike = {
  type?: string;
  toolName?: string;
  name?: string;
  input?: unknown;
  output?: unknown;
  error?: unknown;
};

export function renderAssistant(text: string): void {
  const trimmed = text.trim();
  if (!trimmed) return;
  process.stdout.write(`${colors.green}agent${colors.reset} ${trimmed}\n\n`);
}

export function renderError(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  process.stdout.write(`${colors.red}error${colors.reset} ${message}\n\n`);
}

export function renderToolEvent(event: ToolEventLike): void {
  const name = event.toolName || event.name || event.type || "tool";
  process.stdout.write(`${colors.magenta}tool${colors.reset} ${name}\n`);
}

export function renderModel(model: string): void {
  process.stdout.write(`${colors.cyan}model${colors.reset} ${model}\n\n`);
}
