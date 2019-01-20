[![Waffle.io - Columns and their card count](https://badge.waffle.io/EVNotify/EVNotify.png?columns=all)](https://waffle.io/EVNotify/EVNotify?utm_source=badge) [![Greenkeeper badge](https://badges.greenkeeper.io/EVNotify/EVNotify.svg)](https://greenkeeper.io/)
# EVNotify
EVNotify allows you to control your electric vehicle and let you notify when the specified preset state of charge has been achieved.

### Note:
This repository contains the frontend/client source code. For the backend please visit: https://github.com/EVNotify/EVNotifyBackend.
EVNotify is still in an early stage of development. Errors or unexpected behavior may occur. Furthermore, not all features may be implemented yet.
Stay tuned and please report any issues or suggestions.

### The idea behind EVNotify
Originally this application was developed to have a possibility to remotely see the charging state for the Hyundai IONIQ, which isn't possible in Europe due to missing BlueLink connection.
Then I decided to enhance it so you'll get notified when the desired state of charge has been achieved. Also I want to support more cars in the future.

Imagine the following situation:
You are charging your electric vehicle on a fast charger. To proceed with your road trip, you need to charge until 80%. You are drinking a coffee in the meantime. But you want to drive away as fast as possible because every minute that passes costs time and money. Normally you have to check for the charging state every few minutes, leave everything, physically needs to go to the car, which is annoying.
With EVNotify you can just check the state of charge remotely - or simply gets notified when the desired state of charge is set so you can go. Without having to worry every about your state of charge every few minutes. Simply enjoy!

### Features and benefits of EVNotify
- free to use - available on the [Google Play Store](https://play.google.com/store/apps/details?id=com.evnotify.app)
- state of charge monitoring
- multiple notification possibilities if desired state of charge had been achieved (e.g. Mail, Push, Telegram)
- easy to use
- use your existing hardware
- connect multiple devices together
- continuous development
- open source
- API documentation for developers
- integrated charging stations finder
- more features and supported cars will be added soon

### Prerequisites
To use EVNotify you need to download the Android Application linked above. The app must be installed on an Android device with Android version greater than Android 4.1 (Android 5 or greater recommended). The android device must have a bluetooth connection and optionally an internet connection. The app also runs on Android TV Sticks.
EVNotify communicates over the obd2 interface of the car, so a bluetooth capable obd2-dongle is required. For supported obd2 dongle please have a look at the wiki.

### Contributing
Feel free to help and to contribute to this repository. Even if you can't code, feel free to create issues if you have discovered a bug or a strange behavior. If you want to commit code, please create a pull request for it in a seperate branch (dev or a feature-branch, not master!).
If you are a developer and want to contribute, have a look at the CONTRIBUTING.md file.

### How it works
EVNotify interacts with the electric vehicle over a bluetooth-capable OBD2-Dongle. The device interacting with the Dongle, must be an Android device and has to support Bluetooth.
For full functionality, an internet connection is required.
The readout and monitoring of the state of charge works locally, the notifications are sent over the internet.

The App of EVNotify as well as the Backend has an integrated mechanism to track errors with a tool called Rollbar. This allows faster tracking of uncaught errors.

<a href="https://rollbar.com"><img src="https://rollbar.com/assets/badges/rollbar-partner-badge-light.png" alt="Rollbar Error Tracking" /></a>


### Need help?
Have a look at the Wiki here for EVNotify.

### Additional notes
The use of the software is at your own risk. I am not liable for damage caused by improper use or cheap, fake OBD2 dongle.
