# Lotus App Builder for iOS

The native Lotus App Builder client turns a text request into a validated app specification, previews it with native components, saves projects on the device, and exports a self-contained HTML draft or the JSON specification. Projects are stored locally on the device; cloud project sync is not included in this client.

## Local setup

1. Install dependencies with `npm install`.
2. Optional: copy `.env.example` to `.env.local` to override the default API origin.
3. Start the development client with `npx expo start`.

The app defaults to `https://lotus-app-builder.vercel.app/api/native/generate`. The AI provider key belongs only in the deployed server environment; never add it to an `EXPO_PUBLIC_*` variable or the app bundle. `.env.server.example` lists the server-side variables.

The repository includes a native-compatible Vercel route at `api/native/generate.ts`. It uses the server-side `OPENROUTER_API_KEY` and returns the validated specification shape expected by the app. If you deploy the Expo Router server instead, it also has a matching `/api/native/generate` route under `src/app/api/native/generate+api.ts`; set `EXPO_PUBLIC_API_URL` to that server's origin. The separate Lotus website's `/api/ai/generate` route returns a different response shape and is not used by this client.

The app includes project rename, duplicate, and delete controls, plus links to account help and legal information. In-app account deletion requires the companion Lotus backend account-deletion change to be deployed. HTML export is a responsive frontend draft, not a compiled native app or a complete production backend.

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

