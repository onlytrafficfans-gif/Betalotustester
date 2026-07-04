# Lotus OpenRouter Agent

A hosted Node API and live browser preview powered by OpenRouter `@preset/lotus`.

## Run

```bash
npm install
cp .env.example .env
npm run doctor
npm run smoke
npm run agent:smoke
npm start
```

Set `OPENROUTER_API_KEY` in `.env`. `OPENROUTER_REFERER` and `OPENROUTER_TITLE` map to OpenRouter's optional `HTTP-Referer` and `X-OpenRouter-Title` app identity fields. The default model is `@preset/lotus`; switch inside the TUI with `/model <slug>`, including routed slugs like `~openai/gpt-latest`.

## Commands

- `/help` shows available commands.
- `/model` prints the active model.
- `/model <slug>` switches model for the session.
- `/new` starts a fresh conversation.
- `/exit` quits.

## Tools

- OpenRouter server tools: web search and datetime.
- Local tools: `file_read`, `file_write`, `file_edit`, `glob`, `grep`, `list_dir`, `shell`, and `project_brief`.

The shell tool runs in the project working directory with a timeout and truncated output. The file tools resolve paths under the current working directory.

## Backend Checks

- `npm run doctor` verifies the key, app identity headers, configured model, and current OpenRouter model list.
- `npm run smoke` makes one tiny Chat Completions request using the configured model.
- `npm run agent:smoke` makes one tiny Agent SDK request using `@openrouter/agent` and the local tool stack.
- `npm run preset:inspect` reads `@preset/lotus` and shows whether it is valid for Chat Completions.
- `npm run preset:repair` updates `@preset/lotus` to a valid three-model routing config. This changes the remote OpenRouter preset.
- `npm start` starts the hosted-style HTTP service with a browser preview at `/`.
- `npm run tui` opens the local terminal agent utility for development.
