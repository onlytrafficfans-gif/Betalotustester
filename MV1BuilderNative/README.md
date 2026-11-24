# Lotus App Builder for iOS

The native Lotus App Builder client sends build prompts to the authenticated Lotus code-building engine, which creates and saves a real static web app in the user's Lotus project. The client keeps the linked server project ID on-device so follow-up prompts refine the same app. It also offers a native blueprint preview, source view, and standalone HTML export. The visual blueprint drafts are stored locally; the generated app files are stored in the linked Lotus server project.

## Local setup

1. Install dependencies with `npm install`.
2. Optional: copy `.env.example` to `.env.local` to override the default API origin.
3. Start the development client with `npx expo start`.

The app defaults to `https://www.luckylotus.app`. Build App sends code-generation requests to `/api/native/build`; Update Blueprint uses `/api/native/generate`. Both require the user to be signed in to Lotus. AI provider keys stay on the server and must never be added to an `EXPO_PUBLIC_*` variable or the app bundle. Set `EXPO_PUBLIC_API_URL` to override the server origin.

The `/api/native/build` endpoint uses Lotus's server-side model routing and persists generated files in the user's server project. That route must be deployed before using Build App. The `/api/native/generate` route remains available for blueprint-only edits.

The app includes project rename, duplicate, and delete controls, plus links to account help and legal information. In-app account deletion requires the companion Lotus backend account-deletion change to be deployed. Native code generation currently produces static web apps. Use the full Lotus web builder for multi-file React/Next.js projects, backend data models, integrations, and Vercel deployments. HTML export does not compile an iOS or Android app.

## iOS release builds

The project is configured for EAS production builds and remote build-number increments:

```sh
npm install --global eas-cli
eas login
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

Before the first build, connect this app to the correct Expo project and Apple Developer account. Confirm `com.lotus.appbuilder` is available in App Store Connect and reserve it for Lotus App Builder. The default API origin points to the Lotus Vercel project; its next deployment must include `api/native/generate.ts`, and `OPENROUTER_API_KEY` must be configured there.

## App Store release items

- Add an app record in App Store Connect that uses the final bundle identifier.
- Provide the seller/developer account, support URL, privacy policy URL, age rating, and category.
- Complete App Privacy disclosures based on the production API, analytics, crash reporting, and payment SDKs actually enabled in the submitted build.
- Capture current iPhone and iPad screenshots from release builds and prepare the store description, subtitle, keywords, and review notes.
- Test generation, project persistence, undo, export/share, offline/error handling, and supported device sizes on physical devices before submitting for review.

The website's `/privacy` and `/terms` pages exist, but their statements must be checked against the exact data collection and retention behavior of the native release before submission.

