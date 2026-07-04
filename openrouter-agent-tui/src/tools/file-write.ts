import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { tool } from "@openrouter/agent";
import { resolveInsideCwd } from "./shared.js";

export function createFileWriteTool(cwd: string) {
  return tool({
    name: "file_write",
    description: "Write a complete UTF-8 file. Creates parent directories as needed.",
    inputSchema: z.object({
      path: z.string(),
      content: z.string()
    }),
    execute: async ({ path: filePath, content }) => {
      const target = resolveInsideCwd(cwd, filePath);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, content, "utf8");
      return { path: filePath, bytes: Buffer.byteLength(content, "utf8") };
    }
  });
}
