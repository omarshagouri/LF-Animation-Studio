# Omar Studio development

- Work in the existing checkout on a development branch. Keep pull requests separate from `main` and leave merging to the maintainer.
- Use Node 24 and `npm ci`. Use `npx expo install` to select versions of Expo and native dependencies, and commit the npm lockfile with dependency changes.
- Run `npm run typecheck`, `npm run lint`, `npm test`, and `npx expo install --check` before opening a PR. For app changes also export the iOS bundle with `npx expo export --platform ios --output-dir dist`.
- Register typed routes in `src/app`. Keep each feature in `src/features` and reuse the theme and components in `src/ui`. Keep domain logic independent of React Native so it can run in Node tests.
- Preserve system appearance support, Dynamic Type, VoiceOver labels and safe areas. Verify UI changes on small and large iPhones when iOS tooling is available.
- Keep secrets out of source, logs, Expo public variables and app configuration. Avoid logging meeting contents. Add microphone access, storage and network integrations only when the task calls for them.
- Treat native iOS projects as Expo-generated output. Review config plugin changes and validate native builds on macOS.
