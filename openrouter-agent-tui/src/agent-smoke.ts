import { runAgent } from "./agent.js";
import { loadConfig } from "./config.js";
import { colors } from "./terminal-bg.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const text = await runAgent({
    config,
    model: config.model,
    input: "Reply with exactly: OpenRouter agent online"
  });

  process.stdout.write(`${colors.green}model${colors.reset} ${config.model}\n`);
  process.stdout.write(`${colors.green}reply${colors.reset} ${text.trim()}\n`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${colors.red}agent smoke failed${colors.reset} ${message}\n`);
  process.exitCode = 1;
});
