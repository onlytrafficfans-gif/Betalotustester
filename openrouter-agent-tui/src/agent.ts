import { OpenRouter, maxCost, stepCountIs } from "@openrouter/agent";
import type { AgentConfig } from "./config.js";
import { FREE_MODELS, modelFallbacks, shouldSendFallbackModels, SYSTEM_INSTRUCTIONS } from "./config.js";
import { createTools } from "./tools/index.js";

export type RunAgentOptions = {
  config: AgentConfig;
  model: string;
  input: string;
};

export async function runAgent({ config, model, input }: RunAgentOptions): Promise<string> {
  const client = new OpenRouter({
    apiKey: config.apiKey,
    httpReferer: config.referer,
    appTitle: config.title
  });
  const tools = createTools(config.cwd);

  const attempts = [model, ...FREE_MODELS].filter((candidate, index, candidates) => {
    return candidate.length > 0 && candidates.indexOf(candidate) === index;
  });
  const failures: string[] = [];

  for (const candidate of attempts) {
    try {
      const fallbackModels = modelFallbacks(candidate);
      const result = client.callModel({
        model: candidate,
        ...(shouldSendFallbackModels(candidate) ? { models: fallbackModels } : {}),
        instructions: SYSTEM_INSTRUCTIONS,
        input,
        tools,
        stopWhen: [stepCountIs(config.maxSteps), maxCost(config.maxCostUsd)],
        allowFinalResponse: "Summarize what you did and any remaining issue."
      });

      return await result.getText();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push(`${candidate}: ${message}`);
    }
  }

  throw new Error(`All agent model attempts failed.\n${failures.join("\n")}`);
}
