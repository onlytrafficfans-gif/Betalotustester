import { loadConfig, modelFallbacks } from "./config.js";
import { fetchModels } from "./openrouter-http.js";
import { colors } from "./terminal-bg.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const models = await fetchModels(config);
  const current = models.find((model) => model.id === config.model);
  const fallbacks = modelFallbacks(config.model).filter((model) => {
    return models.some((candidate) => candidate.id === model);
  });
  const freeModels = models
    .filter((model) => model.id.endsWith(":free"))
    .slice(0, 20)
    .map((model) => model.id);

  process.stdout.write(`${colors.green}OpenRouter key${colors.reset} configured\n`);
  process.stdout.write(`${colors.green}App title${colors.reset} ${config.title}\n`);
  process.stdout.write(`${colors.green}Referer${colors.reset} ${config.referer}\n`);
  process.stdout.write(`${colors.green}Configured model${colors.reset} ${config.model}\n`);
  process.stdout.write(`${colors.green}Configured model available${colors.reset} ${config.model.startsWith("@preset/") ? "preset slug, checked by smoke" : current ? "yes" : "no"}\n`);
  process.stdout.write(`${colors.green}Available fallbacks${colors.reset} ${fallbacks.length ? fallbacks.join(", ") : "none"}\n`);

  if (!current && freeModels.length > 0) {
    process.stdout.write(`\n${colors.yellow}Current free models from OpenRouter:${colors.reset}\n`);
    process.stdout.write(`${freeModels.map((model) => `- ${model}`).join("\n")}\n`);
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${colors.red}doctor failed${colors.reset} ${message}\n`);
  process.exitCode = 1;
});
