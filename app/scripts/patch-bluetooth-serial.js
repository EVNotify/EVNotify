#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectRoot = __dirname ? path.resolve(__dirname, '..') : process.cwd();
const targets = [
  path.join(projectRoot, 'plugins/cordova-plugin-bluetooth-serial/src/android/com/megster/cordova/BluetoothSerialService.java'),
  path.join(projectRoot, 'platforms/android/app/src/main/java/com/megster/cordova/BluetoothSerialService.java')
];

const original = [
  '            // Always cancel discovery because it will slow down a connection',
  '            mAdapter.cancelDiscovery();'
].join('\n');

const replacement = [
  '            // Always cancel discovery because it will slow down a connection',
  '            try {',
  '                mAdapter.cancelDiscovery();',
  '            } catch (SecurityException e) {',
  '                Log.e(TAG, "Missing Bluetooth scan permission while connecting.", e);',
  '                connectionFailed();',
  '                return;',
  '            }'
].join('\n');

targets.forEach((target) => {
  if (!fs.existsSync(target)) return;

  const source = fs.readFileSync(target, 'utf8');

  if (source.includes(replacement)) return;
  if (!source.includes(original)) {
    console.warn(`patch-bluetooth-serial: expected block not found in ${target}`);
    return;
  }

  fs.writeFileSync(target, source.replace(original, replacement));
  console.log(`patch-bluetooth-serial: patched ${path.relative(projectRoot, target)}`);
});
