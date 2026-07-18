#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectRoot = __dirname ? path.resolve(__dirname, '..') : process.cwd();
const targets = [
  path.join(projectRoot, 'plugins/cordova-plugin-bluetooth-serial/src/android/com/megster/cordova/BluetoothSerialService.java'),
  path.join(projectRoot, 'platforms/android/app/src/main/java/com/megster/cordova/BluetoothSerialService.java')
];

const serialTargets = [
  path.join(projectRoot, 'plugins/cordova-plugin-bluetooth-serial/src/android/com/megster/cordova/BluetoothSerial.java'),
  path.join(projectRoot, 'platforms/android/app/src/main/java/com/megster/cordova/BluetoothSerial.java')
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
  '                Log.w(TAG, "Missing Bluetooth scan permission while cancelling discovery. Continuing connection.", e);',
  '            }'
].join('\n');

const previousReplacement = [
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

  let source = fs.readFileSync(target, 'utf8');

  if (source.includes(replacement)) return;
  if (source.includes(previousReplacement)) {
    fs.writeFileSync(target, source.replace(previousReplacement, replacement));
    console.log(`patch-bluetooth-serial: patched ${path.relative(projectRoot, target)}`);
    return;
  }
  if (!source.includes(original)) {
    console.warn(`patch-bluetooth-serial: expected block not found in ${target}`);
    return;
  }

  fs.writeFileSync(target, source.replace(original, replacement));
  console.log(`patch-bluetooth-serial: patched ${path.relative(projectRoot, target)}`);
});

const serialPatches = [{
  original: [
    '    // Android 23 requires user to explicitly grant permission for location to discover unpaired',
    '    private static final String ACCESS_COARSE_LOCATION = Manifest.permission.ACCESS_COARSE_LOCATION;',
    '    private static final int CHECK_PERMISSIONS_REQ_CODE = 2;',
    '    private CallbackContext permissionCallback;'
  ].join('\n'),
  replacement: [
    '    // Android 12 requires runtime Bluetooth permissions for paired device access.',
    '    private static final String BLUETOOTH_CONNECT = Manifest.permission.BLUETOOTH_CONNECT;',
    '    private static final String BLUETOOTH_SCAN = Manifest.permission.BLUETOOTH_SCAN;',
    '    private static final int CHECK_BLUETOOTH_CONNECT_REQ_CODE = 3;',
    '    private static final int CHECK_BLUETOOTH_SCAN_REQ_CODE = 4;',
    '    private String permissionAction;',
    '    private CordovaArgs permissionArgs;',
    '    private static final String ACCESS_COARSE_LOCATION = Manifest.permission.ACCESS_COARSE_LOCATION;',
    '    private static final int CHECK_PERMISSIONS_REQ_CODE = 2;',
    '    private CallbackContext permissionCallback;'
  ].join('\n')
}, {
  original: [
    '        boolean validAction = true;',
    '',
    '        if (action.equals(LIST)) {'
  ].join('\n'),
  replacement: [
    '        boolean validAction = true;',
    '',
    '        if (needsAndroidSPermission(BLUETOOTH_CONNECT, callbackContext, action, args, CHECK_BLUETOOTH_CONNECT_REQ_CODE)) {',
    '            return true;',
    '        }',
    '',
    '        if (action.equals(LIST)) {'
  ].join('\n')
}, {
  original: [
    '        } else if (action.equals(DISCOVER_UNPAIRED)) {',
    '',
    '            if (cordova.hasPermission(ACCESS_COARSE_LOCATION)) {'
  ].join('\n'),
  replacement: [
    '        } else if (action.equals(DISCOVER_UNPAIRED)) {',
    '',
    '            if (needsAndroidSPermission(BLUETOOTH_SCAN, callbackContext, action, args, CHECK_BLUETOOTH_SCAN_REQ_CODE)) {',
    '                return true;',
    '            }',
    '            if (cordova.hasPermission(ACCESS_COARSE_LOCATION)) {'
  ].join('\n')
}, {
  original: [
    '        return validAction;',
    '    }',
    '',
    '    @Override',
    '    public void onActivityResult'
  ].join('\n'),
  replacement: [
    '        return validAction;',
    '    }',
    '',
    '    private boolean needsAndroidSPermission(String permission, CallbackContext callbackContext, String action, CordovaArgs args, int requestCode) {',
    '        if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.S || cordova.hasPermission(permission)) {',
    '            return false;',
    '        }',
    '',
    '        permissionCallback = callbackContext;',
    '        permissionAction = action;',
    '        permissionArgs = args;',
    '        cordova.requestPermission(this, requestCode, permission);',
    '        return true;',
    '    }',
    '',
    '    @Override',
    '    public void onActivityResult'
  ].join('\n')
}, {
  original: [
    '                LOG.d(TAG, "User *rejected* location permission");',
    '                this.permissionCallback.sendPluginResult(new PluginResult(',
    '                        PluginResult.Status.ERROR,',
    '                        "Location permission is required to discover unpaired devices.")'
  ].join('\n'),
  replacement: [
    '                LOG.d(TAG, "User *rejected* permission");',
    '                this.permissionCallback.sendPluginResult(new PluginResult(',
    '                        PluginResult.Status.ERROR,',
    '                        "Bluetooth permission is required.")'
  ].join('\n')
}, {
  original: [
    '        switch(requestCode) {',
    '            case CHECK_PERMISSIONS_REQ_CODE:'
  ].join('\n'),
  replacement: [
    '        switch(requestCode) {',
    '            case CHECK_BLUETOOTH_CONNECT_REQ_CODE:',
    '            case CHECK_BLUETOOTH_SCAN_REQ_CODE:',
    '                LOG.d(TAG, "User granted bluetooth permission");',
    '                execute(permissionAction, permissionArgs, permissionCallback);',
    '                permissionAction = null;',
    '                permissionArgs = null;',
    '                permissionCallback = null;',
    '                break;',
    '            case CHECK_PERMISSIONS_REQ_CODE:'
  ].join('\n')
}];

serialTargets.forEach((target) => {
  if (!fs.existsSync(target)) return;

  let source = fs.readFileSync(target, 'utf8');
  let patched = false;

  serialPatches.forEach(({ original, replacement }) => {
    if (source.includes(replacement)) return;
    if (!source.includes(original)) return;
    source = source.replace(original, replacement);
    patched = true;
  });

  if (!patched) return;

  fs.writeFileSync(target, source);
  console.log(`patch-bluetooth-serial: patched ${path.relative(projectRoot, target)}`);
});
