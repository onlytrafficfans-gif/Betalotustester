import { FREE_MODELS } from "./config.js";
import type { AgentSession } from "./session.js";
import { createSession } from "./session.js";
import { colors } from "./terminal-bg.js";

export type CommandResult =
  | { handled: false }
  | { handled: true; exit?: boolean; session?: AgentSession };

export function handleCommand(input: string, session: AgentSession): CommandResult {
  const [command, ...rest] = input.trim().split(/\s+/);
  const arg = rest.join(" ").trim();

  if (command === "/exit" || command === "/quit") {
    return { handled: true, exit: true };
  }

  if (command === "/help") {
    process.stdout.write(`${colors.bold}Commands${colors.reset}
/help              Show this help
/model             Show active model
/model <slug>      Switch model
/new               Start a fresh session
/exit              Quit

Suggested free model slugs:
${FREE_MODELS.map((model) => `- ${model}`).join("\n")}
- ~openai/gpt-latest

`);
    return { handled: true };
  }

  if (command === "/model") {
    if (!arg) {
      process.stdout.write(`${colors.cyan}model${colors.reset} ${session.model}\n\n`);
      return { handled: true };
    }
    session.model = arg;
    process.stdout.write(`${colors.cyan}model${colors.reset} switched to ${session.model}\n\n`);
    return { handled: true };
  }

  if (command === "/new") {
    const next = createSession(session.model);
    process.stdout.write(`${colors.yellow}new session${colors.reset} ${next.id}\n\n`);
    return { handled: true, session: next };
  }

  if (input.startsWith("/")) {
    process.stdout.write(`${colors.red}unknown command${colors.reset} ${command}\n\n`);
    return { handled: true };
  }

  return { handled: false };
}
