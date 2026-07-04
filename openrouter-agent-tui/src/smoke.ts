import { loadConfig } from "./config.js";
import { modelFallbacks } from "./config.js";
import { chatCompletion, fetchModels } from "./openrouter-http.js";
import { colors } from "./terminal-bg.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const candidates = config.model.startsWith("@preset/")
    ? [config.model]
    : (() => {
        return [];
      })();

  if (!config.model.startsWith("@preset/")) {
    const liveModels = new Set((await fetchModels(config)).map((model) => model.id));
    candidates.push(...modelFallbacks(config.model).filter((model, index, models) => {
      return liveModels.has(model) && models.indexOf(model) === index;
    }));
  }

  let answer = "";
  let usedModel = "";
  const failures: string[] = [];

  for (const model of candidates) {
    try {
      answer = await chatCompletion(config, "Reply with exactly: OpenRouter backend online", model);
      usedModel = model;
      break;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push(`${model}: ${message}`);
    }
  }

  if (!usedModel) {
    throw new Error(`No free model completed the smoke check.\n${failures.join("\n")}`);
  }

  process.stdout.write(`${colors.green}model${colors.reset} ${usedModel}\n`);
  process.stdout.write(`${colors.green}reply${colors.reset} ${answer}\n`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${colors.red}smoke failed${colors.reset} ${message}\n`);
  process.exitCode = 1;
});
