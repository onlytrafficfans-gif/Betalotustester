import { z } from "zod";
import { tool } from "@openrouter/agent";

export function createProjectBriefTool(cwd: string) {
  return tool({
    name: "project_brief",
    description: "Return a compact brief about this agent runtime and workspace.",
    inputSchema: z.object({
      includeModels: z.boolean().optional().default(true)
    }),
    execute: async ({ includeModels }) => ({
      cwd,
      purpose: "Terminal coding agent using OpenRouter, local tools, and session persistence.",
      models: includeModels
        ? [
            "openai/gpt-oss-20b:free",
            "qwen/qwen3-coder:free",
            "openai/gpt-oss-120b:free",
            "qwen/qwen3-next-80b-a3b-instruct:free",
            "google/gemma-4-31b-it:free",
            "google/gemma-4-26b-a4b-it:free",
            "nvidia/nemotron-3-super-120b-a12b:free",
            "poolside/laguna-m.1:free"
          ]
        : []
    })
  });
}
