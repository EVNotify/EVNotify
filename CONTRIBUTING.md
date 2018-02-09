## Contributing guidelines

EVNotify is in an early stage of development. So every feedback and help is very appreciated.

You can contribute to EVNotify even as a non-developer.

#### Contributing with an issue creation

Have you found a bug?

Or something that doesn't work as expected?

Or do you have a feature suggestion?

Feel free to create an issue here!
If possible, try to give as much information as possible, as described within the ISSUE_TEMPLATE.md file.

#### Contributing with code

You are a developer and want to enhance or improve EVNotify? Cool!

Or you want to build your own version to be independent from the official version?

Then you'll need to follow these instructions:

###### Prerequisites

In order to be able to build and run EVNotify to test your written code or to use your version, you'll need:

- Linux / Unix-based OS (other OS may work too)
- Git
- working Cordova installation (please search for the official docs)
- Android device with Bluetooth, Internet and Android 4.1 or greater
- compatible Bluetooth-OBD2-Dongle
- a compatible electric vehicle which works with EVNotify

###### First time setup

Once, EVNotify has been configured and built once, it's very easy for future builds to run a new build.

Initially you'll need to get the source code over GitHub.
This can be done via a "Clone" or a "Fork". The latter is recommended, if you want to contribute your code to the official EVNotify version again.

You can fork the project within https://github.com/GPlay97/EVNotify by clicking the "Fork" button. Or you can "clone" the version (only recommended if you don't want to change code!).
This can be done easily with `git clone https://github.com/GPlay97/EVNotify`.

After forking or cloning the project, go to the directory and it's app directory with `cd EVNotify/app`.

You will need to create a client configuration file once with `touch client.js`.
It's important, that the file will be in the `app` directory of EVNotify.
The content of the client.js file must be the following:

```JavaScript
RESTURL = 'https://evnotify.de:8743/', /* you can replace this with your custom EVNotify backend url if exists */
DEBUG = false,
VERSION = '1.X.X'
SOC_CMD = {
    IONIQ: '2105',  /* for compatibility to old versions only! */
    IONIQ_BEV: '2105',
    IONIQ_HEV: '2101',
    IONIQ_PHEV: '2101',
    SOUL_EV: '2105'
},
ROLLBAR_TOKEN = undefined, /* replace with your rollbar token if you want error tracking */
BLOCKDATA = '',
RAWDATA = '',
RUNNING_INTERVAL = false,
LAST_SOC = 0,
RUNNING_SYNC = false,
SYNC_MODE = 'disabled',
LAST_CAR_ACTIVITY = 0,
NOTIFICATION_SENT = false;
```

Once created, you can build your very first EVNotify build.
On the very first run, you'll first need to add the android resources.

This will be achieved with `cordova platform add android`. After that, you can run `cordova build android`. If you've attached your android device with usb debugging turned on, you can also run `cordova run android` to directly deploy the created `apk` to the device.
Otherwise you'll find the compiled `apk` within `EVNotify/platforms/android/build/outputs/android-debug.apk`.

That's it. You've successfully built your own version of EVNotify.

###### Upcoming builds

After you've built the first successful build of EVNotify, new builds can just be created with `cordova build android` or `cordova run android`.


#### Contributing rules

You want to extend / improve EVNotify? And want to send a suggestion of your code to be implemented for everyone? Nice!

Here are some small things, you should keep in mind, before contributing.

- Fork your own copy of EVNotify. Do not clone the project directly if you want to contribute!
- You've created something new? Or changed something? Write documentation to it, write good comments!
- So far so good. Test it! Does the app work as before? Run automated tests, if they exists (currently only available for the backend)
- The app is working, you've documented everything? Cool! Time to publish it. Create a pull request from your Fork to the official version!
- Follow the Pull Request. Changes may be requested from me.
- Keep up the good work and make EVNotify even better!

#### Questions?
You need help? Create issues or contact me via mail (info(at)evnotify.de).
