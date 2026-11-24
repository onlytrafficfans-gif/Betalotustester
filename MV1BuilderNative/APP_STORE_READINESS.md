# Lotus App Builder — App Store readiness

## Prepared in the project

- App display name, URL scheme, and visible in-app labels now use Lotus App Builder.
- Replaced the Expo starter icon with a square Lotus brand icon on an opaque dark background.
- Added iOS build number and iPad support metadata.
- Added an EAS production profile with remote, auto-incrementing build numbers.
- Native generation uses the Lotus production origin by default, with an environment override for other deployments.
- Deployed the authenticated Vercel endpoint at `https://www.luckylotus.app/api/native/generate`; it returns the structured response expected by the iOS app.
- Kept provider credentials server-side and added request validation plus per-user rate limiting to the native endpoint.
- Connected the Expo project `@internetkartel/lotus-app-builder` (project ID `4d9ca0de-52e9-4091-9c0c-fe685715d21c`).
- Configured the production EAS iOS build profile and Apple's exempt-encryption declaration.

## Account-specific items still needed

- Complete Apple Developer sign-in and validate or create iOS distribution credentials. The first EAS build stopped at Apple account authentication; no `.ipa` was queued.
- Confirm `com.lotus.appbuilder` is available in App Store Connect and create the Lotus App Builder app record.
- Confirm support and privacy policy URLs, and review the policy against the native app's actual data handling.
- Complete App Store Connect product-page metadata, privacy disclosures, age rating, screenshots, and review notes.
- Produce an iOS build, install it through TestFlight, and test on physical iPhone and iPad devices before App Review.

The EAS project has been created, but no Apple App Store Connect record, TestFlight build, or App Store submission has been created.
