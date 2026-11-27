# Omar Studio — five-module development branch

This branch extends the previously successful iOS foundation. It is a review candidate, not a production release.

## Implemented paths

- Dashboard: all five tools, counts and explicit preview mode.
- Meetings: native AVAudioRecorder local module, explicit consent, local audio, session timer, text entry, optional authenticated transcription and analysis, action transfer and explicit email send.
- Capture: text/link inbox, local classification, optional authenticated AI analysis and task handoff.
- Secretary: task inbox, due dates, completion and reopen. No notifications/calendar/Gmail ingestion yet.
- Padel: manual score capture, result-point delta, partner/side breakdown and observed win rates. No live database integration or predictive model.
- AmpCoreX: local planning and stage changes, next-action handoff. Not a mirror of the live LF/SF pipelines. No production mutation.
- Private workspace: local native JSON, excluded from backup, protected file storage; browser session-only. No API requests from public preview.
- Backend: optional Node service for transcription, structured text analysis and user-reviewed Gmail delivery. No dependencies beyond Node 24. No credentials committed or included in app.

## Backend setup (not deployed)

Deploy backend/Dockerfile with build context backend to a private, HTTPS-enabled service. Use its secret manager to configure STUDIO_ACCESS_TOKEN (random >=32 characters), OPENAI_API_KEY, optional OPENAI_TEXT_MODEL and OPENAI_TRANSCRIPTION_MODEL. For Gmail configure a user OAuth consent flow with gmail.send scope and store GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, STUDIO_MAIL_FROM and STUDIO_MAIL_TO on the server only. The recipient is fixed server-side. Enter URL and access token in native Settings each session. Never put credentials in EXPO_PUBLIC variables. This initial single-user bearer-token service needs rate limits, rotation and deployment review before real use; avoid shared or work data until approved. Audio uploads capped at 25 MiB including multipart overhead, so longer files need chunking. No background upload or automatic email yet. No provider calls or actual messages were sent while authoring.

## Required verification before merging

1. npm ci; npm run typecheck; npm run lint; npm test; node --test backend/server.test.mjs; npx expo install --check; npm run build:web; npx expo export --platform ios --output-dir dist/ios.
2. Verify Expo discovers the local Swift module and CocoaPods builds it. Run unsigned archive and validate the IPA. Install with AltStore on physical iPhone; check offline launch, permission denial, start/stop, lock screen, call interruption, failed stop, relaunch and persistence, audio file deletion and signing refresh. Current interruption recovery and force-quit recovery are incomplete.
3. Verify browser preview remains phone-sized and session-only; test navigation and all five tools. Do not publish confidential data.
4. Test authenticated backend with synthetic meeting data, mocked provider responses, rate limits, timeout, duplicate request handling and configured email delivery. Confirm provider retention and employer consent before uploading real meeting audio.
5. Only after reviewing successful builds, merge this review branch into feat/ios-app-foundation to use the existing automatic IPA and Pages workflows. Do not merge main.

## Next integrations

Use supported Expo SDK packages for document/photo picker, OCR, share extension and background notifications; verify AltStore free-signing entitlement restrictions. Add scoped OAuth for Gmail/Calendar/Sheets; create calendar items only after user approval. For Padelboard start from user-selected screenshots, validate extracted scores and duplicate detection, then sync to user-approved Sheet. Verify actual AmpCoreX LF/SF schema and Make APIs before adding authenticated read-only status and separate approval-gated production actions. Keep all actual private IDs and tokens in server configuration. Do not run production scenarios during testing.
