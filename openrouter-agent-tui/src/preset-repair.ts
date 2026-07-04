import { loadConfig } from "./config.js";
import { createOpenRouterClient, LOTUS_PRESET_SLUG, REPAIRED_LOTUS_MODELS, presetModels } from "./preset.js";
import { colors } from "./terminal-bg.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const client = createOpenRouterClient(config);

  const updated = await client.presets.createPresetsChatCompletions({
    slug: LOTUS_PRESET_SLUG,
    chatRequest: {
      model: REPAIRED_LOTUS_MODELS[0],
      models: [...REPAIRED_LOTUS_MODELS],
      messages: [
        {
          role: "user",
          content: "Preset repair validation message."
        }
      ]
    }
  });

  const models = presetModels(updated);
  process.stdout.write(`${colors.green}preset repaired${colors.reset} @preset/${LOTUS_PRESET_SLUG}\n`);
  process.stdout.write(`${colors.green}model count${colors.reset} ${models.length}\n`);
  process.stdout.write(models.map((model) => `- ${model}`).join("\n"));
  process.stdout.write("\n");
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${colors.red}preset repair failed${colors.reset} ${message}\n`);
  process.exitCode = 1;
});
