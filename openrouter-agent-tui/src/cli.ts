import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { runAgent } from "./agent.js";
import { loadConfig } from "./config.js";
import { handleCommand } from "./commands.js";
import { Loader } from "./loader.js";
import { createSession, saveSession, toInput } from "./session.js";
import { renderAssistant, renderError } from "./renderer.js";
import { banner, colors } from "./terminal-bg.js";

async function main(): Promise<void> {
  const config = loadConfig();
  let session = createSession(config.model);
  const rl = readline.createInterface({ input, output });
  const loader = new Loader();

  banner(session.model);

  while (true) {
    let prompt: string;
    try {
      prompt = await rl.question(`${colors.cyan}>${colors.reset} `);
    } catch (error) {
      if (error instanceof Error && error.message.includes("readline was closed")) break;
      throw error;
    }
    const trimmed = prompt.trim();
    if (!trimmed) continue;

    const command = handleCommand(trimmed, session);
    if (command.handled) {
      if (command.session) session = command.session;
      if (command.exit) break;
      await saveSession(config.sessionDir, session);
      continue;
    }

    session.messages.push({ role: "user", content: trimmed, at: new Date().toISOString() });
    loader.start("Working");
    try {
      const text = await runAgent({
        config,
        model: session.model,
        input: toInput(session.messages)
      });
      loader.stop();
      session.messages.push({ role: "assistant", content: text, at: new Date().toISOString() });
      renderAssistant(text);
    } catch (error) {
      loader.stop();
      renderError(error);
    }
    await saveSession(config.sessionDir, session);
  }

  rl.close();
}

main().catch((error) => {
  renderError(error);
  process.exitCode = 1;
});
