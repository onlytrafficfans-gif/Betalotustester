import { fetch } from 'expo/fetch';
import Constants from 'expo-constants';

import { authClient } from '@/lib/auth-client';
import { validateGenerationResult } from '@/lib/specification';
import { AppSpecification, GenerationResult } from '@/types/builder';

const configuredBaseUrl = (
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiBaseUrl ||
  'https://www.luckylotus.app'
).replace(/\/$/, '');

export class GenerationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'GenerationError';
  }
}

export async function generateApp(
  prompt: string,
  currentSpecification: AppSpecification,
  signal?: AbortSignal,
  allowDowngrade = false,
): Promise<GenerationResult> {
  const cookie = await authClient.getCookie();
  const response = await fetch(`${configuredBaseUrl}/api/native/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    credentials: process.env.EXPO_OS === 'web' ? 'include' : 'omit',
    body: JSON.stringify({ prompt, currentSpecification, allowDowngrade }),
    signal,
  });
  const body = (await response.json().catch(() => ({}))) as {
    error?: string;
    code?: string;
  };
  if (!response.ok) {
    throw new GenerationError(
      body.error ?? 'Generation failed. The last working preview was preserved.',
      body.code ?? 'GENERATION_FAILED',
      response.status,
    );
  }
  return validateGenerationResult(body);
}
