const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const OPENROUTER_CHAT_URL = 'https://openrouter.ai/api/v1/chat/completions';
export const OPENROUTER_FREE_MODELS = [
  { id: 'qwen/qwen3-235b-a22b:free', label: 'Qwen3 235B A22B', use: 'Best free coding/app-builder pick' },
  { id: 'deepseek/deepseek-r1:free', label: 'DeepSeek R1', use: 'Reasoning, debugging, harder logic' },
  { id: 'deepseek/deepseek-chat-v3-0324:free', label: 'DeepSeek Chat V3 0324', use: 'General builder and UI helper' },
  { id: 'meta-llama/llama-4-maverick:free', label: 'Llama 4 Maverick', use: 'Long context and big app specs' },
  { id: 'mistralai/mistral-small-3.1-24b-instruct:free', label: 'Mistral Small 3.1 24B', use: 'Balanced speed and coding fallback' },
  { id: 'google/gemma-3-27b-it:free', label: 'Gemma 3 27B IT', use: 'Summaries and helper tasks' },
  { id: 'zhipu-ai/glm-4-32b:free', label: 'GLM 4 32B', use: 'Multilingual backup' },
  { id: 'x-ai/grok-3-mini-beta:free', label: 'Grok 3 Mini Beta', use: 'Fast lightweight option' }
];
const DEFAULT_OPENROUTER_MODEL = process.env.EXPO_FORGE_MODEL || OPENROUTER_FREE_MODELS[0].id;
const DEFAULT_OPENAI_MODEL = process.env.EXPO_FORGE_OPENAI_MODEL || 'gpt-5.5';

function buildSystemPrompt() {
  return [
    'You generate premium production-quality app previews as one self-contained HTML document.',
    'Return only complete HTML. No markdown. No explanations.',
    'The preview must feel like a real mobile-first app, not a marketing page and not a mockup.',
    'It must include realistic domain-specific data, multiple app screens or states, native-feeling controls, working in-page JavaScript navigation, polished responsive CSS, and no placeholder copy.',
    'Use code-native UI text and controls. Use CSS/HTML only; no external network assets, no external fonts, no package dependencies.',
    'The HTML must be safe to render in an iframe via srcDoc.',
    'Make it competitive: dense useful product state, excellent typography, real workflows, polished mobile and desktop layouts, and no generic filler.'
  ].join(' ');
}

function stripCodeFence(value) {
  return String(value || '')
    .trim()
    .replace(/^```(?:html)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function extractOutputText(data) {
  if (typeof data?.output_text === 'string') return data.output_text;
  const chunks = [];
  for (const item of data?.output ?? []) {
    for (const content of item?.content ?? []) {
      if (typeof content?.text === 'string') chunks.push(content.text);
    }
  }
  return chunks.join('\n');
}

function looksLikeCompleteHtml(html) {
  return /<!doctype html>/i.test(html) && /<html[\s>]/i.test(html) && /<\/html>/i.test(html);
}

export function canUseAiPreview() {
  return Boolean(process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY);
}

export function getAiPreviewStatus() {
  return {
    enabled: canUseAiPreview(),
    openRouter: Boolean(process.env.OPENROUTER_API_KEY),
    openAI: Boolean(process.env.OPENAI_API_KEY),
    defaultModel: process.env.OPENROUTER_API_KEY ? DEFAULT_OPENROUTER_MODEL : DEFAULT_OPENAI_MODEL,
    models: OPENROUTER_FREE_MODELS
  };
}

export async function generateAiPreviewHtml(input = {}) {
  const prompt = String(input.prompt || input.workflow || '').trim();
  if (!prompt) return null;

  if (process.env.OPENROUTER_API_KEY) {
    return generateOpenRouterPreviewHtml(input, prompt);
  }

  if (process.env.OPENAI_API_KEY) {
    return generateOpenAiPreviewHtml(input, prompt);
  }

  return null;
}

async function generateOpenRouterPreviewHtml(input, prompt) {
  const selectedModel = String(input.previewModel || DEFAULT_OPENROUTER_MODEL);
  const model = OPENROUTER_FREE_MODELS.some((item) => item.id === selectedModel) ? selectedModel : DEFAULT_OPENROUTER_MODEL;
  const response = await fetch(OPENROUTER_CHAT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.EXPO_FORGE_SITE_URL || 'http://localhost:5177',
      'X-Title': 'ExpoForge'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        {
          role: 'user',
          content: JSON.stringify({
            appName: input.appName,
            bundleId: input.bundleId,
            themeColor: input.themeColor,
            prompt
          })
        }
      ],
      temperature: 0.55,
      top_p: 0.92,
      max_tokens: 12000
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter preview failed: ${response.status} ${errorText.slice(0, 240)}`);
  }

  const data = await response.json();
  const html = stripCodeFence(data?.choices?.[0]?.message?.content || '');
  if (!looksLikeCompleteHtml(html)) {
    throw new Error('OpenRouter preview response was not a complete HTML document.');
  }
  return html;
}

async function generateOpenAiPreviewHtml(input, prompt) {
  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: DEFAULT_OPENAI_MODEL,
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text: buildSystemPrompt()
            }
          ]
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: JSON.stringify({
                appName: input.appName,
                bundleId: input.bundleId,
                themeColor: input.themeColor,
                prompt
              })
            }
          ]
        }
      ],
      max_output_tokens: 12000
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI preview failed: ${response.status} ${errorText.slice(0, 240)}`);
  }

  const data = await response.json();
  const html = stripCodeFence(extractOutputText(data));
  if (!looksLikeCompleteHtml(html)) {
    throw new Error('AI preview response was not a complete HTML document.');
  }
  return html;
}
