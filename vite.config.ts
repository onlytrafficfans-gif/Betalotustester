import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
        maximumFileSizeToCacheInBytes: 3000000,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/orghdwyqtpzfspevqhey\.supabase\.co/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: { maxEntries: 100, maxAgeSeconds: 86400 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/api\.groq\.com/,
            handler: 'NetworkOnly',
            options: { cacheName: 'ai-api' },
          },
          {
            urlPattern: /^https:\/\/openrouter\.ai\/api/,
            handler: 'NetworkOnly',
            options: { cacheName: 'ai-api-openrouter' },
          },
          {
            urlPattern: /^https:\/\/generativelanguage\.googleapis\.com/,
            handler: 'NetworkOnly',
            options: { cacheName: 'ai-api-gemini' },
          },
        ],
      },
      manifest: false,
      devOptions: { enabled: false },
    }),
  ],
  server: { port: 3000 },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
