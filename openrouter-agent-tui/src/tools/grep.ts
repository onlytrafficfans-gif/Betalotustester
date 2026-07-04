import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { z } from "zod";
import { tool } from "@openrouter/agent";
import { glob } from "glob";
import { resolveInsideCwd, truncateText } from "./shared.js";

async function runRg(cwd: string, pattern: string, target: string): Promise<string | null> {
  return new Promise((resolve) => {
    const child = spawn("rg", ["--line-number", "--no-heading", pattern, target], { cwd, shell: true });
    let output = "";
    child.stdout.on("data", (chunk: Buffer) => {
      output += chunk.toString("utf8");
    });
    child.stderr.on("data", () => undefined);
    child.on("error", () => resolve(null));
    child.on("close", (code) => {
      if (code === 0 || code === 1) resolve(output);
      else resolve(null);
    });
  });
}

async function nodeSearch(cwd: string, pattern: string, target: string): Promise<string> {
  const regex = new RegExp(pattern, "i");
  const files = await glob(`${target.replace(/\\/g, "/")}/**/*`, {
    cwd,
    nodir: true,
    ignore: ["node_modules/**", ".git/**", "dist/**"]
  });
  const rows: string[] = [];
  for (const file of files.slice(0, 2000)) {
    try {
      const content = await fs.readFile(path.join(cwd, file), "utf8");
      const lines = content.split(/\r?\n/);
      lines.forEach((line, index) => {
        if (rows.length < 100 && regex.test(line)) rows.push(`${file}:${index + 1}:${line}`);
      });
    } catch {
      // Skip binary or unreadable files.
    }
  }
  return rows.join("\n");
}

export function createGrepTool(cwd: string) {
  return tool({
    name: "grep",
    description: "Search text under the current workspace using ripgrep when available, with a Node fallback.",
    inputSchema: z.object({
      pattern: z.string(),
      path: z.string().optional().default(".")
    }),
    execute: async ({ pattern, path: targetPath }) => {
      resolveInsideCwd(cwd, targetPath);
      const rgOutput = await runRg(cwd, pattern, targetPath);
      const output = rgOutput ?? (await nodeSearch(cwd, pattern, targetPath));
      return { pattern, path: targetPath, output: truncateText(output, 120_000) };
    }
  });
}
