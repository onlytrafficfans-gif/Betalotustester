import fs from "node:fs/promises";
import path from "node:path";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  at: string;
};

export type AgentSession = {
  id: string;
  model: string;
  messages: ChatMessage[];
};

export function createSession(model: string): AgentSession {
  return {
    id: new Date().toISOString().replace(/[:.]/g, "-"),
    model,
    messages: []
  };
}

export async function saveSession(sessionDir: string, session: AgentSession): Promise<void> {
  await fs.mkdir(sessionDir, { recursive: true });
  await fs.writeFile(path.join(sessionDir, `${session.id}.json`), JSON.stringify(session, null, 2));
}

export function toInput(messages: ChatMessage[]): string {
  return messages.map((message) => `${message.role.toUpperCase()}: ${message.content}`).join("\n\n");
}
