// Lotus Builder - Universal App Generator
// Secure OpenRouter API endpoint (server-side only)

const AVAILABLE_MODELS = {
  'meta-llama/llama-2-70b-chat': 'Llama 2 70B',
  'mistralai/mistral-7b-instruct': 'Mistral 7B',
  'mistralai/mistral-8x7b-instruct': 'Mistral 8x7B',
  'neural-chat-7b-v3': 'Neural Chat 7B',
  'openchat-3.5': 'OpenChat 3.5',
  'teknium/openhermes-2.5-mistral-7b': 'OpenHermes 2.5',
  'toppy-m-7b': 'Toppy M 7B',
  'dolphin-2.6-mixtral-8x7b': 'Dolphin 2.6'
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, appType, projectContext, mode = 'general', model } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const selectedModel = model || 'meta-llama/llama-2-70b-chat';
  console.log('[API] Using model:', selectedModel);

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  console.log('[API] OpenRouter Key Present:', !!openRouterKey);
  console.log('[API] Key Length:', openRouterKey ? openRouterKey.length : 0);

  if (!openRouterKey) {
    console.error('[API] OPENROUTER_API_KEY is not set in environment');
    return res.status(500).json({
      error: 'AI service unavailable',
      message: 'We\'re unable to connect to the AI engine right now. Please try again in a moment.'
    });
  }

  try {
    // Build the system prompt based on mode and app type
    const systemPrompt = buildSystemPrompt(mode, appType, projectContext);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'HTTP-Referer': 'https://lotus.metallicv1.com',
        'X-OpenRouter-Title': 'Lotus Builder',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.45,
        max_tokens: 8000,
        top_p: 0.95
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenRouter error:', error);
      return res.status(500).json({
        error: 'AI generation failed',
        message: 'We\'re having trouble generating your app right now. Please try again.'
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return res.status(200).json({
      success: true,
      content,
      appType: appType || 'custom',
      model: selectedModel,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      error: 'Connection error',
      message: 'We\'re unable to connect to the AI engine right now. Please try again in a moment or check your AI connection.'
    });
  }
}

// Build context-aware system prompt
function buildSystemPrompt(mode, appType, projectContext) {
  const basePrompt = `You are Lotus Builder, creating beautiful mobile-first web apps.

CRITICAL: Every app must:
1. Fill 100% viewport (no scrollbars unless content naturally needs scrolling)
2. Use polished, modern UI components
3. Include complete layouts: header/nav, content section, footer/actions
4. Use beautiful color schemes and typography
5. Include real sample data and interactions
6. Be fully responsive mobile-first design

HTML/CSS Structure (REQUIRED):
\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #root {
      width: 100%;
      height: 100%;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .app-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: linear-gradient(...);
    }
    .header { padding: 16px; ... }
    .content { flex: 1; overflow-y: auto; padding: 16px; }
    .footer { padding: 16px; border-top: 1px solid ...; }
  </style>
</head>
<body>
  <div id="root">
    <div class="app-container">
      <!-- Header/Nav -->
      <!-- Content (scrollable if needed) -->
      <!-- Footer/Actions -->
    </div>
  </div>
</body>
</html>
\`\`\`

Generate polished, beautiful apps with:
- Clean typography and spacing
- Thoughtful color palettes (not defaults)
- Real component cards/lists/buttons
- Sample data that makes sense
- Navigation and interactions
- Mobile-optimized layouts

No placeholder boxes. No ugly emoji. No generic "Result" text.
Return ONLY valid, complete HTML. No markdown, no explanation.`;

  let contextualAddition = '';

  if (appType) {
    contextualAddition += `\n\nCurrent project type: ${appType}`;
  }

  if (projectContext) {
    contextualAddition += `\nProject context: ${projectContext}`;
  }

  if (mode === 'ui-designer') {
    contextualAddition += '\n\nFocus on visual design, spacing, color, typography, and user experience flows.';
  } else if (mode === 'code-builder') {
    contextualAddition += '\n\nFocus on clean, maintainable code structure and functionality.';
  } else if (mode === 'architect') {
    contextualAddition += '\n\nFocus on app architecture, user flows, and feature planning.';
  }

  return basePrompt + contextualAddition;
}
