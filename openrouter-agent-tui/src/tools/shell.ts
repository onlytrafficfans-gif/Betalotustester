import { spawn } from "node:child_process";
import os from "node:os";
import { z } from "zod";
import { tool } from "@openrouter/agent";
import { truncateText } from "./shared.js";

export function createShellTool(cwd: string) {
  return tool({
    name: "shell",
    description: "Run a shell command in the workspace. Use for builds, tests, inspection, and safe local automation.",
    inputSchema: z.object({
      command: z.string(),
      timeoutSeconds: z.number().int().min(1).max(120).optional().default(120)
    }),
    execute: async ({ command, timeoutSeconds }) => {
      const shell = process.platform === "win32" ? "powershell.exe" : os.userInfo().shell || "/bin/sh";
      const args = process.platform === "win32"
        ? ["-NoProfile", "-Command", command]
        : ["-lc", command];

      return await new Promise((resolve) => {
        const child = spawn(shell, args, { cwd, windowsHide: true });
        let stdout = "";
        let stderr = "";
        const timeout = setTimeout(() => {
          child.kill();
        }, timeoutSeconds * 1000);
        child.stdout.on("data", (chunk: Buffer) => {
          stdout += chunk.toString("utf8");
        });
        child.stderr.on("data", (chunk: Buffer) => {
          stderr += chunk.toString("utf8");
        });
        child.on("close", (code) => {
          clearTimeout(timeout);
          resolve({
            command,
            exitCode: code,
            stdout: truncateText(stdout),
            stderr: truncateText(stderr)
          });
        });
      });
    }
  });
}
