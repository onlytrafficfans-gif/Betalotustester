import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type ChatMessage = { role: string; content: string };

type ProxyRequest = {
  ping?: boolean;
  provider?: string;
  model?: string;
  messages?: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
};

type StoredProvider = {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  models: string[];
};

const SHARED_PROVIDERS: Record<string, { keyEnv: string; baseUrl: string; model: string }> = {
  openrouter_demo: {
    keyEnv: 'OPENROUTER_API_KEY',
    baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'google/gemini-2.0-flash-exp:free',
  },
  openrouter: {
    keyEnv: 'OPENROUTER_API_KEY',
    baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'google/gemini-2.0-flash-exp:free',
  },
  groq: {
    keyEnv: 'GROQ_API_KEY',
    baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
  },
  openai: {
    keyEnv: 'OPENAI_API_KEY',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
  },
  deepseek: {
    keyEnv: 'DEEPSEEK_API_KEY',
    baseUrl: 'https://api.deepseek.com/chat/completions',
    model: 'deepseek-chat',
  },
};

const ALLOWED_PROVIDER_DOMAINS = [
  'openrouter.ai',
  'generativelanguage.googleapis.com',
  'api.groq.com',
  'api.openai.com',
  'api.deepseek.com',
  'api.mistral.ai',
  'api.cohere.ai',
  'api.together.xyz',
  'api.perplexity.ai',
];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function isAllowedProviderUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    return ALLOWED_PROVIDER_DOMAINS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
  } catch {
    return false;
  }
}

function getBearerToken(authHeader: string | null) {
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice('Bearer '.length);
}

async function getUserProvider(providerId: string, authHeader: string | null): Promise<StoredProvider | null> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const token = getBearerToken(authHeader);
  if (!supabaseUrl || !supabaseAnonKey || !token) return null;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData } = await supabase.auth.getUser(token);
  const userId = userData?.user?.id;
  if (!userId) return null;

  const { data, error } = await supabase.from('user_profiles').select('api_keys').eq('id', userId).single();
  if (error || !Array.isArray(data?.api_keys)) return null;

  const provider = (data.api_keys as StoredProvider[]).find((item) => item.id === providerId);
  if (!provider?.apiKey || !isAllowedProviderUrl(provider.baseUrl)) return null;
  return provider;
}

async function resolveProvider(request: ProxyRequest, authHeader: string | null) {
  const providerId = request.provider || 'openrouter_demo';
  const userProvider = await getUserProvider(providerId, authHeader);
  if (userProvider) {
    return {
      baseUrl: userProvider.baseUrl,
      apiKey: userProvider.apiKey,
      model: request.model || userProvider.model,
    };
  }

  const shared = SHARED_PROVIDERS[providerId] || SHARED_PROVIDERS.openrouter_demo;
  const apiKey = Deno.env.get(shared.keyEnv);
  if (!apiKey) {
    throw new Error(`Server provider key is not configured. Set ${shared.keyEnv} in Supabase Edge Function secrets.`);
  }
  return {
    baseUrl: shared.baseUrl,
    apiKey,
    model: request.model || shared.model,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const body = (await req.json()) as ProxyRequest;
    if (body.ping) return json({ ok: true });

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return json({ error: 'messages are required' }, 400);
    }

    const provider = await resolveProvider(body, req.headers.get('authorization'));
    const response = await fetch(provider.baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://betalotus-production.vercel.app',
        'X-Title': 'LOTUS App Builder',
      },
      body: JSON.stringify({
        model: provider.model,
        messages: body.messages,
        temperature: body.temperature ?? 0.7,
        max_tokens: body.max_tokens ?? 1800,
      }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return json({ error: data?.error?.message || data?.error || `Provider request failed (${response.status})` }, 502);
    }

    const content = data?.choices?.[0]?.message?.content || data?.content || data?.text || '';
    return json({ content, usage: data?.usage });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown proxy error';
    return json({ error: message }, 500);
  }
});
