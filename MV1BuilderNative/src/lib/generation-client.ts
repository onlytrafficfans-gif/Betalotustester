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

export type RealBuildResult = {
  projectId: string;
  name: string;
  html: string;
  reply: string;
  version: number;
  entryPath: string;
  routingNotice?: string;
};

export async function buildRealApp(
  projectId: string | undefined,
  prompt: string,
  currentHtml: string | undefined,
  signal?: AbortSignal,
  allowDowngrade = false,
): Promise<RealBuildResult> {
  const cookie = await authClient.getCookie();
  const response = await fetch(`${configuredBaseUrl}/api/native/build`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    credentials: process.env.EXPO_OS === 'web' ? 'include' : 'omit',
    body: JSON.stringify({ projectId, prompt, currentHtml, allowDowngrade }),
    signal,
  });
  const body = await response.json().catch(() => ({})) as RealBuildResult & {
    error?: string;
    code?: string;
    confirmation?: string;
  };
  if (!response.ok) {
    throw new GenerationError(
      body.error ?? 'The app build failed. Your last working code was preserved.',
      body.code ?? 'BUILD_FAILED',
      response.status,
    );
  }
  if (!body.projectId || typeof body.html !== 'string' || !body.entryPath) {
    throw new GenerationError('Lotus returned an incomplete app build.', 'INVALID_BUILD', response.status);
  }
  return body;
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

