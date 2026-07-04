import fs from "node:fs/promises";
import path from "node:path";

const LOG_DIR = path.join(process.cwd(), ".logs");

interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  path: string;
  method: string;
  status?: number;
  duration?: number;
  error?: string;
  userId?: string;
  message: string;
}

class Logger {
  private enabled = process.env.ENABLE_LOGGING !== "false";

  async init(): Promise<void> {
    if (!this.enabled) return;
    try {
      await fs.mkdir(LOG_DIR, { recursive: true });
    } catch {
      console.error("Failed to create log directory");
    }
  }

  private async write(entry: LogEntry): Promise<void> {
    if (!this.enabled) return;
    const date = new Date(entry.timestamp).toISOString().split("T")[0];
    const logFile = path.join(LOG_DIR, `${date}.jsonl`);
    try {
      await fs.appendFile(logFile, JSON.stringify(entry) + "\n");
    } catch {
      console.error("Failed to write log");
    }
  }

  request(
    method: string,
    path: string,
    status: number,
    duration: number,
    userId?: string
  ): void {
    this.write({
      timestamp: new Date().toISOString(),
      level: status >= 400 ? "warn" : "info",
      path,
      method,
      status,
      duration,
      userId,
      message: `${method} ${path} → ${status} (${duration}ms)`
    });
  }

  chat(model: string, promptLen: number, responseLen: number, duration: number, userId?: string): void {
    this.write({
      timestamp: new Date().toISOString(),
      level: "info",
      path: "/api/chat",
      method: "POST",
      userId,
      message: `Chat with ${model}: ${promptLen} → ${responseLen} chars (${duration}ms)`
    });
  }

  error(path: string, method: string, error: Error, userId?: string): void {
    this.write({
      timestamp: new Date().toISOString(),
      level: "error",
      path,
      method,
      userId,
      error: error.message,
      message: `${method} ${path}: ${error.message}`
    });
  }
}

export const logger = new Logger();
