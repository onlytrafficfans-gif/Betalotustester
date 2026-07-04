import fs from "node:fs/promises";
import { z } from "zod";
import { tool } from "@openrouter/agent";
import { resolveInsideCwd } from "./shared.js";

export function createFileEditTool(cwd: string) {
  return tool({
    name: "file_edit",
    description: "Replace one exact text occurrence in a UTF-8 file. Fails unless the old text appears exactly once.",
    inputSchema: z.object({
      path: z.string(),
      oldText: z.string(),
      newText: z.string()
    }),
    execute: async ({ path, oldText, newText }) => {
      const target = resolveInsideCwd(cwd, path);
      const before = await fs.readFile(target, "utf8");
      const first = before.indexOf(oldText);
      if (first === -1) throw new Error("oldText was not found");
      if (before.indexOf(oldText, first + oldText.length) !== -1) {
        throw new Error("oldText appears more than once; provide a larger unique snippet");
      }
      const after = before.replace(oldText, newText);
      await fs.writeFile(target, after, "utf8");
      return {
        path,
        changed: true,
        beforeLength: before.length,
        afterLength: after.length,
        delta: after.length - before.length
      };
    }
  });
}
