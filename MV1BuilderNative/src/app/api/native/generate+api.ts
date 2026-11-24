import { generationJsonSchema, validateGenerationResult, validateSpecification } from '@/lib/specification';

const requestLog = new Map<string, number[]>();

const corsHeaders = () => ({
  'Access-Control-Allow-Origin':
    process.env.LOTUS_ALLOWED_ORIGIN ?? (process.env.NODE_ENV === 'production' ? 'null' : '*'),
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  Vary: 'Origin',
});

const isRateLimited = (request: Request) => {
  if (requestLog.size > 5_000) requestLog.clear();
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const key = forwarded || request.headers.get('x-real-ip') || 'local';
  const now = Date.now();
  const recent = (requestLog.get(key) ?? []).filter((timestamp) => now - timestamp < 60_000);
  if (recent.length >= 10) return true;
  recent.push(now);
  requestLog.set(key, recent);
  return false;
};

const systemPrompt = `You are the design engine inside Lotus App Builder.
Transform the user's request into a polished, production-minded frontend specification.

Design standards:
- Produce a bespoke composition, not a generic dashboard template.
- Use strong visual hierarchy, editorial typography, intentional whitespace, and concise realistic copy.
- Match the requested industry and mood. Avoid repetitive card grids when a more expressive composition fits.
- Use 3-7 sections for focused edits and 5-9 for a new build.
- Preserve unrelated parts of the current specification on follow-up edits.
- Every item must contain all fields; use empty strings when a field is not relevant.
- Use only the allowed section types in the schema.
- Keep contrast accessible and color values as six-digit hex.
- Do not include scripts, HTML, JSX, URLs, package names, secrets, or executable code.

Return only the schema result.`;

export function OPTIONS() {
  return new Response(null, { headers: corsHeaders() });
}

export async function POST(request: Request) {
  try {
    if (isRateLimited(request)) {
      return Response.json(
        { error: 'Too many generation requests. Wait a moment and try again.', code: 'RATE_LIMITED' },
        { status: 429, headers: corsHeaders() },
      );
    }
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return Response.json(
        {
          error: 'Live AI is not configured yet. Approve the secure OPENAI_API_KEY setup to enable generation.',
          code: 'AI_NOT_CONFIGURED',
        },
        { status: 503, headers: corsHeaders() },
      );
    }

    const body = (await request.json()) as {
      prompt?: unknown;
      currentSpecification?: unknown;
    };
    if (typeof body.prompt !== 'string' || body.prompt.trim().length < 3 || body.prompt.length > 2000) {
      return Response.json(
        { error: 'Enter a prompt between 3 and 2,000 characters.', code: 'INVALID_PROMPT' },
        { status: 400, headers: corsHeaders() },
      );
    }
    const currentSpecification = validateSpecification(body.currentSpecification);
    const openAiBaseUrl = process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1';
    const upstream = await fetch(`${openAiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? 'gpt-5.6-terra',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: JSON.stringify({
              request: body.prompt.trim(),
              currentSpecification,
            }),
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'lotus_app_generation',
            strict: true,
            schema: generationJsonSchema,
          },
        },
      }),
    });
    const data = (await upstream.json()) as {
      error?: { message?: string };
      choices?: Array<{ message?: { content?: string; refusal?: string } }>;
    };
    if (!upstream.ok) {
      console.error('OpenAI generation failed', upstream.status, data.error?.message);
      return Response.json(
        { error: 'The AI service could not complete this generation. Try again.', code: 'UPSTREAM_ERROR' },
        { status: 502, headers: corsHeaders() },
      );
    }
    const message = data.choices?.[0]?.message;
    if (message?.refusal) {
      return Response.json(
        { error: 'The requested generation could not be completed.', code: 'MODEL_REFUSAL' },
        { status: 422, headers: corsHeaders() },
      );
    }
    if (!message?.content) throw new Error('The model returned no structured content.');
    const result = validateGenerationResult(JSON.parse(message.content));
    return Response.json(result, { headers: corsHeaders() });
  } catch (error) {
    console.error('Lotus App Builder generation route error', error);
    return Response.json(
      { error: 'Generation failed safely. Your last working preview is still available.', code: 'INVALID_GENERATION' },
      { status: 500, headers: corsHeaders() },
    );
  }
}
