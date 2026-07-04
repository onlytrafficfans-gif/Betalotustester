import fs from "node:fs/promises";
import { z } from "zod";
import { tool } from "@openrouter/agent";
import { limitLines, resolveInsideCwd } from "./shared.js";

export function createFileReadTool(cwd: string) {
  return tool({
    name: "file_read",
    description: "Read a UTF-8 text file from the current workspace. Output is capped for safety.",
    inputSchema: z.object({
      path: z.string().describe("Workspace-relative path to read")
    }),
    execute: async ({ path }) => {
      const target = resolveInsideCwd(cwd, path);
      const buffer = await fs.readFile(target);
      const looksBinary = buffer.subarray(0, 8000).includes(0);
      if (looksBinary) return { path, binary: true, content: "[binary or image file]" };
      return { path, binary: false, content: limitLines(buffer.toString("utf8")) };
    }
  });
}
