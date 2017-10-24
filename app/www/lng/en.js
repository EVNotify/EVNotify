en = JSON.parse('{\
    "DEBUG_MODE_ENABLED": "Debug mode enabled",\
    "DEBUG_MODE_DISABLED": "Debug mode disabled",\
    "TITLE_EVNOTIFY": "EVNotify",\
    "HEADER_OVERVIEW": "Overview",\
    "MENU_OVERVIEW": "Overview",\
    "MENU_CHARGING_STATIONS": "Charging stations",\
    "HEADER_CHARGING_STATIONS": "Charging stations",\
    "HEADER_CHARGING_STATION": "Charging station",\
    "FETCHING_STATIONS": "Fetching stations.. Please wait..",\
    "FETCHING_STATION": "Fetching details from station.. Please wait..",\
    "STATIONS_ERROR": "Error on fetching stations.",\
    "STATION_ERROR": "Error on fetching station details.",\
    "STATION_FAULT": "Station malfunction",\
    "STATION_OPERATIONAL": "Station operational",\
    "STATION_VERIFIED": "Station verified",\
    "STATION_NOT_VERIFIED": "Station not verified",\
    "STATION_BARRIERFREE": "Station barrier-free",\
    "STATION_NOT_BARRIERFREE": "Station not barrier-free",\
    "STATION_NO_INFORMATION": "No information",\
    "STATION_NETWORK": "Charging network",\
    "STATION_OPERATOR": "Operator",\
    "STATION_CHARGING_TIME": "Charging time",\
    "STATION_LOCATION": "Location",\
    "STATION_INFORMATION": "General information",\
    "STATION_FREE_CHARGING": "Free charging",\
    "STATION_FREE_PARKING": "Free parking",\
    "POSITION_ERROR": "Failed to retrieve location. Allow permissions for location.",\
    "CARDS_ERROR": "Failed to retrieve charge cards.",\
    "LIST_VIEW": "List view",\
    "MAPS_VIEW": "Maps view",\
    "FAVORITES": "Favorites",\
    "GENERAL_VIEW": "General",\
    "ACCESS_VIEW": "Access",\
    "LOG_VIEW": "Log",\
    "MENU_CHARGE": "Charging cycles",\
    "MENU_NOTIFYME": "NotifyMe",\
    "MENU_SETTINGS": "Settings",\
    "MISSING_CONFIGURATION": "No device or car selected. Please visit the settings.",\
    "NEXT": "Next",\
    "CANCEL": "Cancel",\
    "YES": "Yes",\
    "NO": "Nein",\
    "LANGUAGE_SETUP": "Language selection",\
    "LNG_EN": "English",\
    "LNG_DE": "German",\
    "WELCOME": "Welcome to EVNotify",\
    "WELCOME_TEXT": "Before you can be notified, you first have to create an account.\
    It is required to manage your notifications. Ensure that you have an active internet and bluetooth connection.\
    The app also requires to have a OBD2-Dongle. Please turn bluetooth on every time you use EVNotify.",\
    "LOGIN_TYPE_LOGIN": "Use existing account",\
    "LOGIN_TYPE_REGISTER": "Create new account",\
    "REGISTER": "Create account",\
    "REGISTER_TEXT": "Almost there. Misses only a password. For your own safety please use a strong password (at least with 6 characters).",\
    "PASSWORD_LENGTH_ERROR": "The password must be at least 6 characters.",\
    "CONNECTION_ERROR": "Network error. Please try again.",\
    "SETUP_COMPLETE": "Done!",\
    "SETUP_COMPLETE_TEXT": "You are now ready to track your state of charge of your electric vehicle. All you have to do now, \
    is to set your notifications and to select your OBD2-Dongle, which needs to be connected on the OBD2-Interface of the car.\
    After that save. All settings can be adjusted at any time. Please have in mind, that some OBD2-Dongle even stays active when the car is turned off for a longer time.\
    For that reason do not let the OBD2-Dongle connected to the car for a longer time. If you have questions or fouund a bug, feel free to visit the repository on GitHub.\
    EVNotify is still on an early stage of development. Please do not forget - there is a lot of work behind it. If something does not work, report it - it will be fixed ;-)",\
    "LOGIN": "Login",\
    "LOGIN_TEXT": "Login with your existing account (AKey).",\
    "LOGIN_PASSWORD": "Password",\
    "LOGIN_PASSWORD_TEXT": "Now enter the password of the account.",\
    "LOGIN_FAILED": "Login failed.",\
    "LOGIN_SUCCESSFUL": "Login successful.",\
    "AKEY_LENGTH_ERROR": "The akey must be 6 characters long.",\
    "OLD_PASSWORD": "Old password",\
    "OLD_PASSWORD_TEXT": "Please enter your old password.",\
    "NEW_PASSWORD": "New password",\
    "NEW_PASSWORD_TEXT": "Now enter your new password.",\
    "NEW_PASSWORD_RETYPE": "Retype password",\
    "NEW_PASSWORD_RETYPE_TEXT": "Retype your new password for confirmation.",\
    "PASSWORD_MISMATCH": "The passwords do not match.",\
    "CHANGE_PASSWORD_FAILED": "Password change failed.",\
    "CHANGE_PASSWORD_SUCCESSFUL": "Password successfully changed.",\
    "CHARGING_STATE": "State of charge ",\
    "NOTIFICATION_SENT_ERROR": "An error occured trying to sent the notifications.",\
    "BLUETOOTH_DATA_SENT_ERROR": "An error occured trying to send data via bluetooth.",\
    "BLUETOOTH_CONNECTED": "Connection successfully established. Now a communication with the car will be established!",\
    "BLUETOOTH_NOT_CONNECTED": "Connection failed.",\
    "PREPARATION": "Preparation.. Please wait..",\
    "RESET_SUCCESSFULL": "OBD2-Dongle successfully configured.",\
    "BLUETOOTH_CONNECTION_ERROR": "A bluetooth connection could not be established with the device.",\
    "BLUETOOTH_DISABLED": "Bluetooth is disabled. Please turn bluetooth on!",\
    "UNSUPPORTED_CAR": "The car is currently not supported. More cars will be added soon.",\
    "UNSUPPORTED_DEVICE": "Your platform is not supported. A web-version is coming soon.",\
    "SETTINGS_PASSWORD": "Password",\
    "SETTINGS_PASSWORD_TEXT": "Please enter your password to save the settings.",\
    "SET_SETTINGS_FAILED": "Saving the settings failed.",\
    "GET_SETTINGS_FAILED": "Fetching the settings failed.",\
    "SET_SETTINGS_SUCCESSFUL": "The settings have been saved successfully.",\
    "HEADER_SETTINGS": "Settings",\
    "SETTINGS_ACCOUNT": "Account",\
    "SETTINGS_AKEY": "AKey",\
    "CHANGE_PASSWORD": "Change password",\
    "LANGUAGE": "Language",\
    "NOTIFICATIONS": "Notifications",\
    "EMAIL_NOTIFICATION": "Mail-Adress",\
    "PUSH_NOTIFICATION": "Push-Notification",\
    "TELEGRAM_NOTIFICATION": "Telegram-Notification",\
    "TELEGRAM_MANAGE_NOTIFICATION": "Manage Telegram integration",\
    "TELEGRAM_UNSUBSCRIBE": "Deactivate telegram notifications",\
    "TELEGRAM_UNSUBSCRIBE_TEXT": "To no longer receive telegram notifications, simply write /unsubscribe to the \<a href=\\\"https://telegram.me/evnotifybot\\\"\>Telegram-Bot\<\/a\>.\
    You can reenable the telegram notifications at any times.",\
    "TELEGRAM_SUBSCRIBE": "Activate telegram notifications",\
    "TELEGRAM_SUBSCRIBE_TEXT": "To activate telegram notifications, just write /subscribe to the \<a href=\\\"https://telegram.me/evnotifybot\\\"\>Telegram-Bot\<\/a\>.\
    You have to specify the token below. Do not share this with others! Preferably you should delete the message on telegram after the setup.",\
    "SETTINGS_SOC_HELP": "The desired state of charge at which the notifications should be sent.",\
    "SETTINGS_SYSTEM": "System",\
    "SETTINGS_DEVICES": "Bluetooth-Device",\
    "SETTINGS_POLLING": "Polling-Interval",\
    "SETTINGS_SYNC": "Automatic syncronization",\
    "INTERVAL_0": "deactivated",\
    "INTERVAL_5": "every 5 seconds",\
    "INTERVAL_10": "every 10 seconds",\
    "INTERVAL_30": "every 30 seconds",\
    "INTERVAL_60": "every minute",\
    "INTERVAL_300": "every 5 minutes",\
    "INTERVAL_600": "every 10 minutes",\
    "INTERVAL_1800": "every half an hour",\
    "INTERVAL_3600": "every hour",\
    "POLLING_WARNING": "Short polling intervals lead to increased battery consumption.",\
    "SYNC_WARNING": "Short syncronization intervals leads to increased data usage",\
    "SWITCH_ACCOUNT": "Change account",\
    "SWITCH_ACCOUNT_TEXT": "Connect as many devices as you want. Just register with an existing account here. Specify the AKey of the account to be used.",\
    "SYNC_SETTINGS_FAILED": "Syncronization failed.",\
    "SYNC_SETTINGS_SUCCESSFUL": "Syncronization successful.",\
    "SWITCH_ACCOUNT_SUCCESSFUL": "Account changed successfully.",\
    "SYNC": "Sync settings",\
    "SYNC_TEXT": "Here you have the possibility to manually synchronize the settings. You can either get the current settings or set them for other linked devices. This can overwrite existing settings!",\
    "SYNC_TYPE_PULL": "Get settings",\
    "SYNC_TYPE_PUSH": "Set settings",\
    "SAVE_SETTINGS": "Save settings",\
    "SYNC_MODE_DISABLED": "Auto-Sync is not enabled.",\
    "SYNC_MODE_AUTO": "Auto-Sync active. Mode: Automatic change",\
    "SYNC_MODE_UPLOAD": "Auto-Sync active. Mode: Send state of charge only",\
    "SYNC_MODE_DOWNLOAD": "Auto-Sync active. Mode: Receive state of charge only"\
}');
