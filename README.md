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

### Option 2: Groq (recommended -- fast, cheap)
```bash
cp .env.example .env
# Edit .env:
VITE_GROQ_API_KEY=gsk_your_key_here
VITE_AI_PROVIDER=groq
```

### Option 3: OpenAI
```bash
cp .env.example .env
# Edit .env:
VITE_OPENAI_API_KEY=sk-your_key_here
VITE_AI_PROVIDER=openai
```

## API Key Safety

**VITE_ prefixed environment variables are bundled into the frontend JavaScript bundle.** They are visible to anyone who opens the browser's developer tools. This is acceptable for:
- Local development
- Private demos
- Prototyping

**For production deployments, AI requests must go through a backend proxy.** See `src/lib/ai/backendProxy.ts` for the recommended structure. Never expose real API keys in client-side code that ships to users.

## Architecture

```
User Chat Prompt
  -> AI Provider (Mock / Groq / OpenAI)
  -> Structured JSON Response (schema patches)
  -> Validation Layer
  -> Schema Diffing (apply patches incrementally)
  -> Live Preview Re-renders (phone / tablet / desktop)
  -> Changes Applied Summary
  -> Auto-save to localStorage
  -> Export to downloadable React/Vite zip
```

## Features

| Feature | Status |
|---------|--------|
| Chat-to-App | Complete |
| Live Preview (phone/tablet/desktop) | Complete |
| Schema Diffing (incremental updates) | Complete |
| Export Code (downloadable zip) | Complete |
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
public/            # PWA assets (manifest, icons, screenshots)
tests/             # Test suite (utils, builder, exports)
```

## Manual Setup Required

The following binary image files need to be added to the `public/` folder manually (they cannot be pushed via the GitHub API):

1. `public/icon-192.png` -- PWA icon (192x192)
2. `public/icon-512.png` -- PWA icon (512x512)
3. `public/logo-lotus.png` -- LOTUS logo
4. `public/screenshot-narrow.png` -- PWA narrow screenshot
5. `public/screenshot-wide.png` -- PWA wide screenshot

### Adding Binary Files

**Option A: Git CLI (if you have push access)**
```bash
git clone https://github.com/onlytrafficfans-gif/Betalotustester.git
cd Betalotustester
# Copy the 5 image files into public/
git add public/*.png
git commit -m "Add PWA image assets"
git push
```

**Option B: GitHub Web Interface**
1. Go to https://github.com/onlytrafficfans-gif/Betalotustester
2. Navigate to the `public/` folder
3. Click "Add file" -> "Upload files"
4. Upload each image file

## License

MIT
