[![Waffle.io - Columns and their card count](https://badge.waffle.io/GPlay97/EVNotify.png?columns=all)](https://waffle.io/GPlay97/EVNotify?utm_source=badge)
# EVNotify
EVNotify allows you to control your electric vehicle and let you notify when the specified preset state of charge has been achieved.

### Note:
This repository contains the frontend/client source code. For the backend please visit: https://github.com/GPlay97/EVNotifyBackend.
EVNotify is still in an early stage of development. Errors or unexpected behaviour may occur. Furthermore, not all features may be implemented yet.
Stay tuned and please report any issues or suggestions.

### The idea behind EVNotify
Originally this application was developed to have a possibility to remotly see the charging state for the Hyundai IONIQ, which isn't possible in Europe due to missing BlueLink connection.
Then I decided to enhance it so you'll get notified when the desired state of charge has been achieved. Also I want to support more cars in the future.

Imagine the following situation:
You are charging your electric vehicle on a fast charger. To proceed with your roadtrip, you need to charge until 80%. You are drinking a coffee in the meantime. But you want to drive away as fast as possible because every minute that passes costs time and money. Normally you have to check for the charging state every few minutes, leave everything, physically needs to go to the car, which is annoying.
With EVNotify you can just check the state of charge remotly - or simply gets notified when the desired state of charge is set so you can go. Without having to worry every about your state of charge every few minutes. Simply enjoy!

### Features and benefits of EVNotify
- free to use - available on the [Google Play Store](https://play.google.com/store/apps/details?id=com.evnotify.app)
- state of charge monitoring
- multiple notification possibilities if desired state of charge had been achieved (e.g. Mail, Push, Telegram)
- easy to use
- use your existing harware
- connect multiple devices together
- continuous development
- open source
- more features and supported cars will be added soon

### Prerequisites
To use EVNotify you need to download the Android Application linked above. The app must be installed on an Android device with Android version greater than Android 4.1 (Android 5 or greater recommended). The android device must have a bluetooth connection and a internet connection. The app also runs on Android TV Sticks.
EVNotify communicates over the obd2 interface of the car, so a bluetooth capable obd2-dongle is required. For supported obd2 dongle please have a look at the wiki.

### Contributing
Feel free to help and to contribute to this repository. Even if you can't code, feel free to create issues if you have discovered a bug or a strange behavior. If you want to commit code, please create a pull request for it in a seperate branch (dev or a feature-branch, not master!).

### Need help?
Have a look at the Wiki here for EVNotify.
