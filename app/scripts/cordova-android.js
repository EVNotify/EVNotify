#!/usr/bin/env node

const path = require('path');
const { spawnSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const androidHome = process.env.ANDROID_HOME || path.join(process.env.HOME || '', 'Android', 'Sdk');
const cordovaBin = path.join(projectRoot, 'node_modules', '.bin', process.platform === 'win32' ? 'cordova.cmd' : 'cordova');
const androidPath = [
  path.join(androidHome, 'cmdline-tools', 'latest', 'bin'),
  path.join(androidHome, 'platform-tools')
].join(path.delimiter);

const env = Object.assign({}, process.env, {
  ANDROID_HOME: androidHome,
  ANDROID_SDK_ROOT: process.env.ANDROID_SDK_ROOT || androidHome,
  CORDOVA_DISABLE_TELEMETRY: process.env.CORDOVA_DISABLE_TELEMETRY || '1',
  XDG_CONFIG_HOME: process.env.XDG_CONFIG_HOME || '/tmp/evnotify-config',
  PATH: androidPath + path.delimiter + process.env.PATH
});

const args = process.argv.slice(2);
const result = spawnSync(cordovaBin, args.length ? args : ['build', 'android'], {
  cwd: projectRoot,
  env,
  stdio: 'inherit'
});

process.exit(result.status === null ? 1 : result.status);
