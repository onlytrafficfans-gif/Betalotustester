# LOTUS App Builder

A real, live app builder powered by AI. Describe what you want in chat, and LOTUS builds it -- with a live phone preview that updates instantly.

![LOTUS](https://img.shields.io/badge/LOTUS-App%20Builder-black?style=flat-square&logo=react&logoColor=10b981)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss)

## Quick Start

```bash
npm install
npm run dev        # Opens on localhost:3000
npm run build      # Production build
npm run preview    # Preview production build
npm run test:run   # Run test suite
```

## AI Provider Setup

### Option 1: Shared Demo AI Key
All accounts can use the built-in `LOTUS Demo AI` provider when the Supabase Edge Function secret is configured. This keeps the real key out of GitHub and out of browser JavaScript.

Deploy the Edge Function:

```bash
supabase functions deploy ai-proxy
```

Set at least one shared provider secret in the same Supabase project used by `VITE_SUPABASE_URL`:

```bash
supabase secrets set OPENROUTER_API_KEY=your_openrouter_key
```

Optional shared secrets supported by `supabase/functions/ai-proxy/index.ts`:

```bash
supabase secrets set GROQ_API_KEY=your_groq_key
supabase secrets set OPENAI_API_KEY=your_openai_key
supabase secrets set DEEPSEEK_API_KEY=your_deepseek_key
supabase secrets set GEMINI_API_KEY=your_gemini_key
```

### Option 2: Per-account Groq or OpenRouter
Open Settings inside the builder, paste a Groq or OpenRouter key, choose the model, and select that provider under Active Provider. These endpoints use OpenAI-compatible chat completions.

### Option 3: Custom OpenAI-Compatible Provider
Use Settings -> Add Custom Provider with a chat completions endpoint, model name, and API key.

## API Key Safety

The shared demo provider key is stored as a Supabase Edge Function secret and is not committed to the repo.

Provider keys entered in Settings are demo keys stored client-side/account-side for convenience. They may be visible in browser state or Supabase records depending on deployment configuration. This is acceptable for:
- Local development
- Private demos
- Prototyping

**For production deployments, AI requests must go through a backend proxy.** This repo includes `supabase/functions/ai-proxy/index.ts` and the frontend proxy caller in `src/lib/ai/backendProxy.ts`. Never expose real API keys in client-side code that ships to users.

## Supabase Database Setup

If the app shows `Project changes are local only. Supabase project storage could not be reached.`, the configured Supabase project is missing the LOTUS tables or RLS policies.

Run this file in the Supabase SQL editor for the same project used by `VITE_SUPABASE_URL`:

```text
supabase/migrations/001_lotus_demo_schema.sql
```

Required Vercel/local environment variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Architecture

```
User Chat Prompt
  -> AI Provider (Shared OpenRouter / Groq / OpenAI / Gemini / OpenAI-compatible)
  -> Structured JSON Response (schema patches)
  -> Validation Layer
  -> Schema Diffing (apply patches incrementally)
  -> Live Preview Re-renders (phone / tablet / desktop)
  -> Changes Applied Summary
  -> Auto-save to Supabase when configured
  -> Export to downloadable static/PWA zip
```

## Features

| Feature | Status |
|---------|--------|
| Chat-to-App | Complete |
| Live Preview (phone/tablet/desktop) | Complete |
| Schema Diffing (incremental updates) | Complete |
| Export Code (downloadable static/PWA zip) | Complete |
| Project Management (save/rename/delete) | Complete |
| Bottom Tab Navigation | Complete |
| Model Selector | Complete |
| Groq AI Provider | Complete |
| OpenAI AI Provider | Complete |
| Supabase Backend | Complete |
| GitHub Integration | Complete |
| PWA Support | Complete |
| Dark/Light Theme | Complete |
| Skills / Agents | Beta |
| File Upload | Beta |
| Image Upload | Beta |
| Connector | Beta |
| View App | Coming Soon |
| Deploy | Coming Soon |
| Backend Proxy | Complete via Supabase Edge Function |

## Tech Stack

React 19 + TypeScript + Vite + Tailwind CSS + Zustand + JSZip + Lucide Icons + shadcn/ui + Supabase + PWA

## Project Structure

```
src/
  components/
    auth/          # AuthScreen -- login/signup with OAuth
    builder/       # All builder UI components
    ui/            # 53 shadcn/ui components
  hooks/           # usePWA, useTheme, use-mobile
  lib/
    ai/            # AI providers and Supabase Edge Function proxy client
    builder/       # App schema, renderer, export generators
    github/        # GitHub API client and storage
    skills/        # Pre-installed skills library
    supabase/      # Auth, storage, database clients
    theme/         # Dual-palette theme system
  pages/           # Home page
  state/           # Zustand builder store
public/            # Logo, PWA icons, and screenshots
tests/             # Test suite (utils, builder, exports)
```

## Public Assets

The demo includes the required public image assets in `public/`:

1. `public/icon-192.png` -- PWA icon (192x192)
2. `public/icon-512.png` -- PWA icon (512x512)
3. `public/logo-lotus.png` -- LOTUS logo
4. `public/screenshot-narrow.png` -- PWA narrow screenshot
5. `public/screenshot-wide.png` -- PWA wide screenshot

Exports generate their own included `icon.svg`, so downloaded demo zips do not reference missing icon files.

## License

MIT

## Security & Quality Improvements

This deployment includes comprehensive security hardening and code quality improvements based on production audit:

### ✅ Security Fixes
- **API Key Protection**: Hardcoded Supabase fallback removed, environment variables required (fail-fast)
- **Backend Proxy**: AI requests routed through Supabase Edge Functions (prevents key exposure)
- **HTML Escaping**: All schema field interpolations escaped to prevent XSS in exports
- **RLS Policies**: Database row-level security enforces user data isolation
- **Custom Provider Validation**: Endpoint URLs validated against allowlist (prevents SSRF)

### ✅ Code Quality
- Extensive test coverage for critical components (auth, settings, chat)
- Large file refactoring (split 1356-line and 1029-line modules)
- Type safety improvements (replaced `any` with proper schemas)
- Performance optimizations (fixed list key warnings, polling replaced with events)

### ✅ Production Readiness
- Vercel deployment with security headers (CSP, HSTS, X-Frame-Options)
- Environment documentation and validation
- Comprehensive security guidelines in `SECURITY.md`
- Zero vulnerabilities in dependencies (`npm audit`)

## Deployment on Vercel

**Live Production URL**: https://audit-repo-six.vercel.app

### Environment Variables

Set these in your Vercel project settings:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Set shared AI keys as Supabase Edge Function secrets, not Vercel `VITE_` variables:

```bash
supabase secrets set OPENROUTER_API_KEY=your_openrouter_key
supabase functions deploy ai-proxy
```

See `SECURITY.md` for complete configuration guidelines.

