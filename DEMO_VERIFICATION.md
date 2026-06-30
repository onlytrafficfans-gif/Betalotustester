# LOTUS Demo Verification Checklist

Last updated: 2026-06-30

This checklist separates code-verified demo behavior from remote checks that require a live Supabase project, live user account, and optional provider API key. The app should stay usable if Supabase tables or provider keys are missing; those cases should surface clean errors and keep the Demo Mock path available.

## Verified In Code

- Fresh build path: `npm run build`
- Test suite path: `npm run test:run`
- Settings can register OpenAI-compatible providers such as Groq and OpenRouter into the runtime provider list.
- `sendMessage` uses the selected provider when it has an endpoint and API key.
- Demo Mock remains the default fallback and updates the preview schema.
- Provider failures add a clean assistant error suggesting Demo Mock.
- Renderer uses `schema.activeScreenId`, with fallback to the first screen.
- Bottom navigation can request active screen changes through the existing navigation callback.
- Uploaded `imageAssets` render in preview when components reference `assetId`, `imageAssetId`, `src`, or `image`.
- Static/PWA export uses the active schema screen and includes image asset data URLs.
- Exported PWA files include `icon.svg` and do not reference missing PNG icons.
- Public assets exist and are non-empty:
  - `public/logo-lotus.png`
  - `public/icon-192.png`
  - `public/icon-512.png`
  - `public/screenshot-wide.png`
  - `public/screenshot-narrow.png`

## Manual Supabase Verification Required

Use a fresh browser profile or clear local storage before the run.

1. Start the app with `npm run dev`.
2. Sign up with a new email/password account.
3. Confirm the auth screen transitions to the builder.
4. Log out.
5. Log back in with the same account.
6. Refresh the page and confirm the returning Supabase session opens the builder without re-entering credentials.
7. Create a project and confirm it appears in the sidebar.
8. Rename the project and refresh to confirm the new name reloads from Supabase.
9. Switch between at least two projects and confirm each schema remains separate.
10. Send a Demo Mock chat message and confirm the preview updates.
11. Refresh and confirm the updated schema reloads.
12. Delete a project and refresh to confirm it remains deleted.
13. If the `projects` or `user_profiles` tables are missing, confirm the app logs a clear LOTUS error and keeps the local demo usable.

## Manual Provider Verification Required

1. Open Settings.
2. Add a Groq or OpenRouter key.
3. Confirm the saved provider appears in Active Provider.
4. Select the saved provider.
5. Send a chat prompt.
6. Confirm the network request is sent to the provider chat completions endpoint with `model` and `messages`.
7. Confirm a successful provider response updates the preview.
8. Force a bad key and confirm the chat shows: "Generation failed. Check provider settings or switch to Demo Mock."
9. Switch back to Demo Mock and confirm chat works again.

## Export Verification

1. Create or load a project with multiple screens.
2. Set the active screen via bottom navigation or schema state.
3. Upload an image and reference it from an image component.
4. Export as PWA or static zip.
5. Open the zip and confirm:
   - `index.html` renders the active screen.
   - `manifest.json` references included `icon.svg`.
   - Uploaded image data URLs appear in `index.html`.
   - No exported file references missing `icon-192.png` or `icon-512.png`.
