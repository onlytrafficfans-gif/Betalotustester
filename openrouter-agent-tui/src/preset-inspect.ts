import { loadConfig } from "./config.js";
import { createOpenRouterClient, LOTUS_PRESET_SLUG, presetModels } from "./preset.js";
import { colors } from "./terminal-bg.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const client = createOpenRouterClient(config);
  const preset = await client.presets.get({ slug: LOTUS_PRESET_SLUG });
  const models = presetModels(preset);

  process.stdout.write(`${colors.green}preset${colors.reset} @preset/${LOTUS_PRESET_SLUG}\n`);
  process.stdout.write(`${colors.green}model count${colors.reset} ${models.length}\n`);
  process.stdout.write(models.map((model) => `- ${model}`).join("\n"));
  process.stdout.write("\n");

  if (models.length > 3) {
    process.stdout.write(`${colors.yellow}status${colors.reset} invalid for chat completions: OpenRouter accepts 3 models or fewer\n`);
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${colors.red}preset inspect failed${colors.reset} ${message}\n`);
  process.exitCode = 1;
});
