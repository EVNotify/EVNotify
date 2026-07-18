For web/browser:

  cd /home/gplay97/Developing/EVNotify/app
  . "$HOME/.nvm/nvm.sh"
  nvm use 22.5.1
  npm install
  ./node_modules/.bin/rollup -c
  ./node_modules/.bin/cordova build browser

  For Android, first make sure these exist:

  - JDK with javac
  - Android SDK at $HOME/Android/Sdk
  - Gradle 8.14.2 available, either system-wide or downloaded locally

  Environment:

  cd /home/gplay97/Developing/EVNotify/app
  . "$HOME/.nvm/nvm.sh"
  nvm use 22.5.1

  export ANDROID_HOME="$HOME/Android/Sdk"
  export ANDROID_SDK_ROOT="$HOME/Android/Sdk"
  export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

  If you do not have Gradle installed system-wide, use the local temp download flow:

  mkdir -p /tmp/evnotify-gradle
  cd /tmp/evnotify-gradle
  curl -L -o gradle-8.14.2-bin.zip https://services.gradle.org/distributions/gradle-8.14.2-bin.zip
  unzip -q -o gradle-8.14.2-bin.zip

  export PATH="/tmp/evnotify-gradle/gradle-8.14.2/bin:$PATH"

  Then build Android:

  cd /home/gplay97/Developing/EVNotify/app
  npm run build:android:release

  Release outputs:

  - AAB: app/platforms/android/app/build/outputs/bundle/release/app-release.aab
  - APK: app/platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk

  16 KB alignment check on the APK:

  $HOME/Android/Sdk/build-tools/35.0.0/zipalign -c -P 16 -v 4 \
    app/platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk

  Before a real release, replace:

  - app/google-services.json
  - placeholder Google Maps API key in app/config.xml / app/package.json
