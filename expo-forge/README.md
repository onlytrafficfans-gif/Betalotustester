# ExpoForge

ExpoForge is a Vite frontend plus Node backend for turning a plain-language app prompt into a real HTML app preview first, then exporting an Expo project ZIP after the preview direction is useful.

## Run

```bash
npm install
npm run dev
```

In another terminal:

```bash
npm run client
```

Open `http://localhost:5177`.

## Best Preview Engine

ExpoForge works without a model key by using the built-in local premium preview generator.

For the strongest prompt-to-preview results, set an OpenRouter key and use the free model pool:

```bash
OPENROUTER_API_KEY=your_real_key
EXPO_FORGE_MODEL=qwen/qwen3-235b-a22b:free
```

Then restart the Node server. `/api/preview` will use OpenRouter first and fall back to the local generator if the model is unavailable.

The UI includes these free model options:

- `qwen/qwen3-235b-a22b:free`
- `deepseek/deepseek-r1:free`
- `deepseek/deepseek-chat-v3-0324:free`
- `meta-llama/llama-4-maverick:free`
- `mistralai/mistral-small-3.1-24b-instruct:free`
- `google/gemma-3-27b-it:free`
- `zhipu-ai/glm-4-32b:free`
- `x-ai/grok-3-mini-beta:free`

## API

- `POST /api/generate` returns the generated file manifest.
- `POST /api/preview` returns the generated app preview as a complete HTML document.
- `POST /api/export.zip` returns a downloadable Expo project ZIP.
- `GET /api/health` verifies the Node service.

## Output

Each generated Expo app includes:

- Expo SDK 57 project files
- React Native mobile-first app UI
- `app.config.ts`
- `eas.json`
- EAS preview workflow
- EAS store release workflow with approval before submit
- App Store and Google Play metadata drafts based on the app brief

No Apple, Google, or Expo credentials are embedded. Store upload uses real EAS authentication at release time.
