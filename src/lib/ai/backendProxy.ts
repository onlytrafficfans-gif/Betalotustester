/**
 * Backend Proxy
 * 
 * Proxies AI requests through the Supabase Edge Function to avoid
 * exposing API keys in the frontend.
 */

import { supabase } from "@/lib/supabase/client";

const EDGE_FUNCTION_NAME = "ai-proxy";

interface ProxyRequest {
  provider: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface ProxyResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Send a request to the AI through the backend proxy
 */
export async function proxyAIRequest(request: ProxyRequest): Promise<ProxyResponse> {
  const { data, error } = await supabase.functions.invoke(EDGE_FUNCTION_NAME, {
    body: request,
  });

  if (error) {
    console.error("Backend proxy error:", error);
    throw new Error(`Backend proxy failed: ${error.message}`);
  }

  if (data?.error) {
    throw new Error(`AI request failed: ${data.error}`);
  }

  return {
    content: data.content || data.text || "",
    usage: data.usage,
  };
}

/**
 * Check if the backend proxy is available
 */
export async function isBackendProxyAvailable(): Promise<boolean> {
  try {
    const { error } = await supabase.functions.invoke(EDGE_FUNCTION_NAME, {
      body: { ping: true },
    });
    return !error;
  } catch {
    return false;
  }
}
