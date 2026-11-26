# Omar Studio

Omar Studio is a personal native iPhone app for AI-powered tools. The first module, AI Meeting Assistant, demonstrates a timed meeting session, history, meeting details and a pending processing status. The demo requests no microphone permission, makes no service calls and keeps history in memory until the app restarts.

## Development

Use Node 24 (see `.nvmrc`) with npm. The app uses Expo SDK 58, TypeScript, and React Navigation's native stack.

```sh
npm ci
npm start
```

In Codex cloud, if the home directory is read-only, set `npm_config_cache=/tmp/omar-npm`, `EXPO_HOME=/tmp/omar-expo` and `EXPO_NO_TELEMETRY=1` before running npm or Expo. Linux supports static checks and iOS JavaScript bundling. Use a Mac with Xcode and an iPhone simulator or physical iPhone to validate native behavior. On macOS, `npm run ios` opens an available compatible Expo client. For a native debug build, use `npx expo run:ios` with Xcode installed.

### Checks

```sh
npm run typecheck
npm run lint
npm test
npx expo install --check
npx expo export --platform ios --output-dir dist
```

The tests cover meeting session transitions, history ordering, pending status and duration formatting. The export checks that Metro can resolve and bundle the iOS entry point and assets. For device validation, open the dashboard, visit Settings in both system appearances, start and stop a demo meeting, and open its details from history. Check VoiceOver, large text and smaller iPhone layouts.

## Architecture

| Path | Responsibility |
| --- | --- |
| `src/app` | App composition, providers and typed native navigation |
| `src/ui` | Shared light and dark palettes, typography, cards and controls |
| `src/features/dashboard` | Entry point for tools |
| `src/features/settings` | System appearance and meeting data information |
| `src/features/meetings` | Meeting screens, in-memory session provider and pure domain model |
| `tests` | Node tests for domain behavior |

New tools should own their screens and domain logic and register typed routes in `src/app`. The meeting session provider owns state across navigation. The timer derives elapsed time from timestamps, so the display can catch up when the screen returns.

## Credentials and meeting data

This build needs no credentials. Future provider keys should stay on a backend or in GitHub Actions secrets when required by CI. Expo public variables and configuration bundled into the app are readable on the device. Use iOS Keychain via Expo SecureStore for user session tokens when authentication is implemented. Store audio and transcripts separately with an explicit retention and deletion policy. Before enabling recording or uploading, design consent, permissions and failure handling.

## Native build and sideloading roadmap

Generate the native project from Expo configuration on a macOS GitHub Actions runner. Pin Xcode to a version supported by the SDK, install locked dependencies, run the JS checks, then validate a simulator build before attempting a device archive. Record the resulting deployment target, entitlements and archive packaging. Keep signing files and credentials out of the repository.

AltStore Classic installation is a separate compatibility milestone. Verify that a clean-install IPA can be re-signed and installed using a free Apple account, then check launch and refresh on a physical iPhone. Free provisioning limits and entitlement support must be tested before relying on this path. An Expo bundle export produces JavaScript and assets, not an IPA.

For the meeting module, validate recording permissions, interruptions and background behavior on device before adding transcription. Define storage and consent before connecting a backend for transcripts, summaries, decisions, assigned actions and deadlines. Add email delivery after users can review the content and recipients.
