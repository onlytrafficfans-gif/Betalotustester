import fs from "node:fs/promises";
import { z } from "zod";
import { tool } from "@openrouter/agent";
import { resolveInsideCwd } from "./shared.js";

export function createListDirTool(cwd: string) {
  return tool({
    name: "list_dir",
    description: "List files and folders in one workspace directory. Returns at most 500 entries.",
    inputSchema: z.object({
      path: z.string().optional().default(".")
    }),
    execute: async ({ path }) => {
      const target = resolveInsideCwd(cwd, path);
      const entries = await fs.readdir(target, { withFileTypes: true });
      return {
        path,
        count: entries.length,
        entries: entries.slice(0, 500).map((entry) => ({
          name: entry.name,
          type: entry.isDirectory() ? "dir" : "file"
        }))
      };
    }
  });
}
