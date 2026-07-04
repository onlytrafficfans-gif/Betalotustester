import crypto from "node:crypto";
import { ChatMessage } from "./openrouter-http.js";

export interface SessionData {
  id: string;
  created: string;
  lastActivity: string;
  messages: ChatMessage[];
  model: string;
  apiKey?: string;
}

// In-memory store with TTL (15 minutes of inactivity)
const sessions: Map<string, SessionData> = new Map();
const SESSION_TTL = 15 * 60 * 1000;

export function createSession(model: string, apiKey?: string): string {
  const id = crypto.randomBytes(8).toString("hex");
  const now = new Date().toISOString();
  sessions.set(id, {
    id,
    created: now,
    lastActivity: now,
    messages: [],
    model,
    apiKey
  });
  return id;
}

export function getSession(id: string): SessionData | null {
  const session = sessions.get(id);
  if (!session) return null;

  // Check TTL
  const lastActivity = new Date(session.lastActivity).getTime();
  if (Date.now() - lastActivity > SESSION_TTL) {
    sessions.delete(id);
    return null;
  }

  // Update last activity
  session.lastActivity = new Date().toISOString();
  return session;
}

export function addMessage(sessionId: string, message: ChatMessage): boolean {
  const session = getSession(sessionId);
  if (!session) return false;
  session.messages.push(message);
  // Keep last 20 messages
  if (session.messages.length > 20) {
    session.messages = session.messages.slice(-20);
  }
  return true;
}

export function getSessionHistory(sessionId: string): ChatMessage[] | null {
  const session = getSession(sessionId);
  return session?.messages || null;
}

export function cleanupExpiredSessions(): void {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    const lastActivity = new Date(session.lastActivity).getTime();
    if (now - lastActivity > SESSION_TTL) {
      sessions.delete(id);
    }
  }
}

// Cleanup every 5 minutes
setInterval(cleanupExpiredSessions, 5 * 60 * 1000);
