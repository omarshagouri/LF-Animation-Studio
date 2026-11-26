# Omar Studio technical review

Scope covers the current dashboard, settings, meeting demo, shared UI, and iOS and web build paths. This is a source and build review. Device behavior, VoiceOver, and AltStore installation require physical iPhone testing.

## High priority

| Finding | Recommendation |
| --- | --- |
| Release verification stops at packaging unless someone installs the IPA. An archive cannot exercise free-account signing, app launch or offline behavior. [iOS workflow](../.github/workflows/ios-ipa.yml) | Record a signed-device smoke test covering installation, first and offline launch, both appearances, session demo, and refresh through AltStore. |
| The current meeting state is in memory, uses process-local counters for identity, and has no audio permission or storage boundary. That is suitable for the demo. Real recordings or transcripts introduce retention and disclosure risks. [Session provider](../src/features/meetings/session.tsx) | Before connecting audio or AI, design explicit consent, least-privilege permissions, persistent identifiers, retention and deletion. Keep provider credentials off clients and exclude meeting content from telemetry, build artifacts, and browser preview data. |

## Medium priority

| Finding | Recommendation |
| --- | --- |
| Tests cover the pure reducer and duration formatting. They do not catch navigation, timers, asset loading, keyboard focus, or rendered layout regressions. [Tests](../tests/meetings.test.ts) | Add a regular web browser smoke test and a native device or simulator check before expanding the app. Include light and dark themes, keyboard controls, VoiceOver, Dynamic Type, and small screens. |
| Elapsed time uses wall-clock timestamps. A clock change can move the live timer backward or distort the stored duration. The timer also refreshes four times per second but displays only whole seconds. [Timer](../src/features/meetings/MeetingScreens.tsx) and [session state](../src/features/meetings/model.ts) | Separate wall time for the date from elapsed time, and update the display on second boundaries. Define whether interruptions and time in the background count once recording exists. |
| The session provider is mounted above every route, and the history renders all rows inside a ScrollView. This is small and simple for the demo. [App composition](../src/app/App.tsx) and [meeting screens](../src/features/meetings/MeetingScreens.tsx) | Keep application-wide providers limited as tools grow. Narrow meeting subscriptions or move to feature-scoped state when there is a measured need. Paginate or virtualize history once it becomes persistent and potentially large. |
| The processing label remains pending for all new entries because no processing runs. The status union has no failure state. [Meeting model](../src/features/meetings/model.ts) | When introducing processing, define explicit transitions, failure and retry states, and their UX. Keep the preview clearly labeled as a simulation. |
| JavaScript dependencies are locked and checked. CocoaPods resolves on each clean build and the hosted Xcode image can change. [Package lock](../package-lock.json) and [iOS workflow](../.github/workflows/ios-ipa.yml) | Record the pod resolution and runner image used for release candidates. Review lockfile and toolchain updates deliberately, and rerun native and web checks together. |
| The production dependency audit reports one moderate denial-of-service advisory in minimatch and two propagated findings through Expo fingerprint and Expo. The suggested fix is a major Expo downgrade. [Advisory](https://github.com/advisories/GHSA-g3hv-75wg-m249) | Track the upstream Expo fix and retest both builds when a compatible update resolves it. Avoid passing untrusted glob patterns to build tooling. |

## Low priority

| Finding | Recommendation |
| --- | --- |
| The app already separates routes, feature screens, pure logic, and shared UI. Feature screens import the central route map, and the two meeting screens live in one file. [Routes](../src/app/routes.ts) and [meeting screens](../src/features/meetings/MeetingScreens.tsx) | Keep this structure for the current scope. As more tools arrive, give larger features their own typed nested navigation or screen modules. |
| Typography and colors are shared, and the app follows the operating system theme. Cards and rows use consistent spacing. Mobile navigation stacks differ between web and iOS, and page state resets on reload. [Shared UI](../src/ui/components.tsx) and [theme](../src/ui/theme.ts) | Keep browser preview interactions representative. Evaluate long labels, large text, and compact viewport heights. Add stable web URLs only if review needs deep links. |
