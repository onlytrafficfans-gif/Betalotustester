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

### Option 1: Mock Mode (default -- no API key needed)
```bash
# Works out of the box. Limited to demo responses.
```

### Option 2: Groq or OpenRouter
Open Settings inside the builder, paste a Groq or OpenRouter key, choose the model, and select that provider under Active Provider. These endpoints use OpenAI-compatible chat completions.

### Option 3: Custom OpenAI-Compatible Provider
Use Settings -> Add Custom Provider with a chat completions endpoint, model name, and API key.

## API Key Safety

Provider keys entered in Settings are demo keys stored client-side/account-side for convenience. They may be visible in browser state or Supabase records depending on deployment configuration. This is acceptable for:
- Local development
- Private demos
- Prototyping

**For production deployments, AI requests must go through a backend proxy.** See `src/lib/ai/backendProxy.ts` for the recommended structure. Never expose real API keys in client-side code that ships to users.

## Architecture

```
User Chat Prompt
  -> AI Provider (Mock / Groq / OpenRouter / OpenAI-compatible)
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
| Backend Proxy | Structure only -- implement per-deployment |

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
    ai/            # AI providers (OpenAI, Groq, Mock)
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
