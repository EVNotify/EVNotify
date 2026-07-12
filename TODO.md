# TODO

## Required before Play Store release

- Replace `app/google-services.json` placeholder content with the real Firebase Android config for `com.evnotify.app`.
- Add a real Web Client ID to Firebase config so `cordova-plugin-firebasex` stops warning about missing `client_type: 3`.
- Replace `GOOGLE_API_KEY_FOR_ANDROID` placeholder in:
  - `app/config.xml`
  - `app/package.json`
- Decide on release signing flow and add the required signing properties or keystore-based process for production releases.
- Run a real Android device sanity test on Android 14/15:
  - login
  - Bluetooth connection
  - background mode
  - local notifications
  - push subscription/unsubscription
  - charging/station navigation flows

## Build/tooling cleanup

- Decide whether to install Gradle system-wide or commit/document a stable local Gradle bootstrap flow.
- Consider pinning or trimming `cordova-plugin-firebasex` variables if you want a smaller, less noisy `package.json`.
- Review deprecated Gradle warnings from `app/platforms/android/build/reports/problems/problems-report.html`.
- Verify whether Crashlytics is desired for all release builds, since it brings native libraries into the APK/AAB.

## Final validation

- Build final release AAB and verify it still succeeds after real Firebase/API key/signing config is added.
- Re-run APK alignment check for 16 KB support:
  - `zipalign -c -P 16 -v 4 <release-apk>`
- Upload the release artifact to Play Console internal testing before production rollout.
