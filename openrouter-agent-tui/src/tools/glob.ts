import { glob } from "glob";
import { z } from "zod";
import { tool } from "@openrouter/agent";

export function createGlobTool(cwd: string) {
  return tool({
    name: "glob",
    description: "Find files by glob pattern under the current workspace. Returns at most 1000 paths.",
    inputSchema: z.object({
      pattern: z.string(),
      ignore: z.array(z.string()).optional()
    }),
    execute: async ({ pattern, ignore }) => {
      const matches = await glob(pattern, {
        cwd,
        nodir: true,
        ignore: ignore || ["node_modules/**", ".git/**", "dist/**"],
        windowsPathsNoEscape: true
      });
      return { pattern, count: matches.length, files: matches.slice(0, 1000) };
    }
  });
}
