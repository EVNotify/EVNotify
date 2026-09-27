#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const themeFile = path.join(__dirname, '..', 'platforms', 'android', 'app', 'src', 'main', 'res', 'values', 'cdv_themes.xml');

if (!fs.existsSync(themeFile)) {
  process.exit(0);
}

const original = fs.readFileSync(themeFile, 'utf8');
let updated = original.replace(
  'name="Theme.App.SplashScreen" parent="Theme.SplashScreen.IconBackground"',
  'name="Theme.App.SplashScreen" parent="Theme.SplashScreen"'
);

updated = updated.replace(
  '<item name="windowSplashScreenAnimatedIcon">@drawable/ic_cdv_splashscreen</item>',
  '<item name="windowSplashScreenAnimatedIcon">@mipmap/ic_launcher</item>'
);

updated = updated.replace(/\s*<item name="windowSplashScreenBehavior">.*<\/item>\n?/g, '\n');

if (updated !== original) {
  fs.writeFileSync(themeFile, updated);
  console.log('Patched Android splash theme to use launcher icon and Theme.SplashScreen');
}
