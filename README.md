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

## Build the standalone iPhone IPA

The [Build iPhone IPA workflow](https://github.com/omarshagouri/Omar_Studio/actions/workflows/ios-ipa.yml) runs on pushes to `feat/ios-app-foundation`. It uses a hosted macOS 26 runner with Xcode 26.6, Node 24 and CocoaPods. It checks the locked dependencies, generates the Xcode project with Expo, and archives the Release scheme for generic physical iOS devices. The Expo build phase embeds the JavaScript bundle and assets. The app uses `com.omarshagouri.omarstudio` in the archive.

1. Open the repository’s [Actions tab](https://github.com/omarshagouri/Omar_Studio/actions) and select the successful **Build iPhone IPA** run for the desired commit. To run manually after the workflow is present on the default branch, choose **Run workflow**, select `feat/ios-app-foundation`, and run it. GitHub requires the workflow on the default branch to expose manual dispatch. Development-branch pushes can trigger it before that.
2. Sign in to GitHub and download **Omar-Studio.ipa** from the run’s Artifacts section or the link in its summary. GitHub wraps the artifact in a ZIP. Extract that outer ZIP and keep the inner `Omar-Studio.ipa` intact. Artifacts are retained for 14 days.
3. Use AltStore Classic to sign and install the IPA. The IPA is produced without a provisioning profile. The workflow needs no signing credentials, EAS subscription, or locally installed Xcode.

The generated project targets iOS 16.4 or later. The build checks the app’s bundle identifier, iPhoneOS metadata, arm64 architecture, JavaScript bundle, and packaged icon font.

### Install from Windows with AltStore Classic

1. Follow AltStore’s [Windows setup guide](https://faq.altstore.io/altstore-classic/how-to-install-altstore-classic/windows). Install the desktop versions of iTunes and iCloud linked by AltStore and install the Windows AltServer. Unzip the AltServer download, run `Setup.exe`, and launch AltServer.
2. Connect the unlocked iPhone to the PC by USB. Tap **Trust** on the iPhone and enter its passcode if prompted. In iTunes, select the phone, enable **Sync with this iPhone over Wi-Fi**, and click **Apply**.
3. From the AltServer Windows notification-area icon, choose **Install AltStore** and select the iPhone. Enter your Apple Account credentials when AltServer prompts. A free Apple Account is sufficient for personal provisioning. Keep credentials out of GitHub and the app.
4. On the iPhone, open **Settings → General → VPN & Device Management**, select the developer profile for your Apple Account and trust it. Enable **Developer Mode** in **Settings → Privacy & Security**, restart when prompted, then confirm after reboot. Follow any on-device trust prompts before opening AltStore.
5. Copy `Omar-Studio.ipa` to the iPhone’s Files app, for example with iCloud Drive. Keep the phone connected by USB or on the same Wi-Fi network as the PC with AltServer running.
6. Open AltStore Classic, go to **My Apps**, tap **+**, and choose `Omar-Studio.ipa`. If prompted, sign in to AltStore with the same Apple Account. AltStore applies its own provisioning and may adjust the identifier during re-signing. If installation succeeds, open Omar Studio from the Home Screen.
7. To verify standalone launch, close Omar Studio, disconnect from the PC, turn on Airplane Mode, and reopen the app. Open the meeting assistant and start and stop a demo session. Record the iPhone model, iOS version, and whether installation and offline launch passed.
8. Free provisioning typically expires after seven days. Before expiry, keep AltServer running and use **My Apps → Refresh All** with the iPhone connected or on the same Wi-Fi. Free-account app and App ID limits also apply.

For the meeting module, validate recording permissions, interruptions and background behavior on device before adding transcription. Define storage and consent before connecting a backend for transcripts, summaries, decisions, assigned actions and deadlines. Add email delivery after users can review the content and recipients.

## Browser preview

For local browser development, run `npm ci` and `npm run web`. For a static export, run `npm run build:web`. The same screens and demo state are used on web and iOS. Desktop browsers add a phone-sized frame. On narrow screens the preview fills the viewport.

The **Deploy browser preview** workflow exports and publishes each push to `feat/ios-app-foundation` through GitHub Pages. Set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. If the `github-pages` environment restricts deployment branches, allow `feat/ios-app-foundation`. Pages availability and site visibility depend on the repository and account plan. The workflow's deployment job links the canonical site URL after it publishes. The public repository and preview are for simulated meetings. Keep credentials, recordings, transcripts and other private data out of source, build outputs, and deployment artifacts. Route future sensitive integrations through an authenticated backend. Expo variables and frontend configuration are visible to anyone who downloads the app bundle. See the [technical review](docs/technical-review.md) for follow-up priorities.

## Five-module review branch

The five-module browser candidate is distributed separately as **Five-module-web-preview** on the review workflow. Download and extract it, then serve the extracted directory with `npx expo serve <directory> --port 4173` from this checkout after `npm ci`. For a local build, use `npm run build:web`, `npx playwright install chromium`, and `npm run test:browser`. The browser uses in-memory data and cannot send it to the backend. The unified Pages workflow builds both branches before deployment. It serves the foundation at the published root and the five-module review candidate under `/preview/`. The `github-pages` deployment environment must permit both branches.

See the [handover](docs/five-module-handover.md) for native device acceptance tests and [staging and connector verification](docs/staging-and-connectors.md) for Cloud Run approval, IAM, Secret Manager, and provider contracts.
