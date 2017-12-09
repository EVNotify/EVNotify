de = JSON.parse('{\
    "DEBUG_MODE_ENABLED": "Debug-Modus aktiviert",\
    "DEBUG_MODE_DISABLED": "Debug-Modus deaktiviert",\
    "TITLE_EVNOTIFY": "EVNotify",\
    "HEADER_OVERVIEW": "Übersicht",\
    "MENU_OVERVIEW": "Übersicht",\
    "MENU_CHARGING_STATIONS": "Stromtankstellen",\
    "HEADER_CHARGING_STATIONS": "Stromtankstellen",\
    "HEADER_CHARGING_STATION": "Stromtankstelle",\
    "FETCHING_STATIONS": "Rufe Stationen ab.. Bitte warten..",\
    "FETCHING_STATION": "Rufe Details der Station ab.. Bitte warten..",\
    "STATIONS_ERROR": "Fehler beim Abrufen der Stationen.",\
    "STATION_ERROR": "Fehler beim Abrufen der Stationsdetails.",\
    "STATION_FAULT": "Ladesäule defekt",\
    "STATION_OPERATIONAL": "Ladesäule betriebsbereit",\
    "STATION_VERIFIED": "Ladesäule verifiziert",\
    "STATION_NOT_VERIFIED": "Ladesäule nicht verifiziert",\
    "STATION_BARRIERFREE": "Barrierefrei",\
    "STATION_NOT_BARRIERFREE": "Nicht barrierefrei",\
    "STATION_NO_INFORMATION": "Keine Information",\
    "STATION_NETWORK": "Ladenetzwerk",\
    "STATION_OPERATOR": "Betreiber",\
    "STATION_CHARGING_TIME": "Ladeweile",\
    "STATION_LOCATION": "Standort",\
    "STATION_INFORMATION": "Allgemeine Informationen",\
    "STATION_FREE_CHARGING": "Kostenloses Laden",\
    "STATION_FREE_PARKING": "Kostenloses Parken",\
    "POSITION_ERROR": "Fehler beim Abrufen der aktuellen Position. Erteile die Berechtigung für den Standort.",\
    "CARDS_ERROR": "Fehler beim Abrufen der Ladekarten.",\
    "LIST_VIEW": "Listenansicht",\
    "MAPS_VIEW": "Kartenansicht",\
    "FAVORITES": "Favoriten",\
    "GENERAL_VIEW": "Allgemeines",\
    "ACCESS_VIEW": "Zugang",\
    "LOG_VIEW": "Ladelog",\
    "MENU_CHARGE": "Ladezyklen",\
    "MENU_NOTIFYME": "NotifyMe",\
    "MENU_SETTINGS": "Einstellungen",\
    "MISSING_CONFIGURATION": "Kein Gerät und/oder Auto ausgewählt. Bitte in den Einstellungen entsprechend eintragen",\
    "NEXT": "Weiter",\
    "CANCEL": "Abbrechen",\
    "YES": "Ja",\
    "NO": "Nein",\
    "LANGUAGE_SETUP": "Sprachauswahl",\
    "LNG_EN": "Englisch",\
    "LNG_DE": "Deutsch",\
    "WELCOME": "Willkommen bei EVNotify",\
    "WELCOME_TEXT": "Bevor Du Dich allerdings über den Ladezustand Deines Elektroautos benachrichtigen lassen kannst,\
    muss zunächst ein Account erstellt werden. Dieser dient zur Verwaltung der Benachrichtigungen.\
    Stelle sicher, dass Du über eine aktive Internet- sowie Bluetooth-Verbindung verfügst.\
    Die App benötigt zudem einen entsprechenden OBD2-Dongle. Schalte das Bluetooth bei der Nutzung von EVNotify immer ein.",\
    "LOGIN_TYPE_LOGIN": "Bestehenden Account benutzen",\
    "LOGIN_TYPE_REGISTER": "Neuen Account erstellen",\
    "REGISTER": "Account erstellen",\
    "REGISTER_TEXT": "Fast geschafft. Fehlt nur noch ein Passwort. Zur eigenen Sicherheit bitte ein starkes Passwort wählen (mind. 6 Zeichen).",\
    "PASSWORD_LENGTH_ERROR": "Das Passwort muss aus mindestens 6 Zeichen bestehen.",\
    "CONNECTION_ERROR": "Netzwerkfehler. Bitte erneut versuchen.",\
    "SETUP_COMPLETE": "Geschafft!",\
    "SETUP_COMPLETE_TEXT": "Du bist nun bereit, den Ladezustand Deines Elektroautos zu überwachen. Alles was Du nun tun musst, ist Deine gewünschten\
    Benachrichtigunswege anzugeben und den OBD2-Dongle, welcher an die OBD2-Schnittstelle des Autos angesteckt werden muss, auszuwählen.\
    Anschließend speichern. Alle Einstellungen können jederzeit angepasst werden. Bitte beachte, dass manche OBD2-Dongle auch dann aktiv bleiben, wenn das Auto längst aus ist.\
    Lasse den OBD2-Dongle daher nicht über einen längeren Zeitraum angesteckt. Falls Du Fragen oder Fehler gefunden hast, geh bitte in das entsprechende Repository auf GitHub.\
    EVNotify befindet sich noch im Entwicklungsstadium. Bitte nicht vergessen - es steckt viel Arbeit hinter all dem. Wenn was nicht klappt, melden - dann wird es behoben ;-)",\
    "LOGIN": "Anmelden",\
    "LOGIN_TEXT": "Melde Dich mit Deinem bestehenden Account an (AKey).",\
    "LOGIN_PASSWORD": "Passwort",\
    "LOGIN_PASSWORD_TEXT": "Gib nun das Passwort des Accounts an.",\
    "LOGIN_FAILED": "Anmeldung fehlgeschlagen.",\
    "LOGIN_SUCCESSFUL": "Anmeldung erfolgreich.",\
    "AKEY_LENGTH_ERROR": "Der AKey muss aus 6 Zeichen bestehen.",\
    "OLD_PASSWORD": "Altes Passwort",\
    "OLD_PASSWORD_TEXT": "Bitte gib Dein altes Passwort an.",\
    "NEW_PASSWORD": "Neues Passwort",\
    "NEW_PASSWORD_TEXT": "Gib nun Dein neues Passwort an.",\
    "NEW_PASSWORD_RETYPE": "Passwort wiederholen",\
    "NEW_PASSWORD_RETYPE_TEXT": "Gib Dein neues Passwort zur Bestätigung erneut an.",\
    "PASSWORD_MISMATCH": "Die Passwörter stimmen nicht überein.",\
    "CHANGE_PASSWORD_FAILED": "Fehler beim Ändern des Passworts aufgetreten.",\
    "CHANGE_PASSWORD_SUCCESSFUL": "Das Passwort wurde erfolgreich geändert.",\
    "CHARGING_STATE": "Ladezustand ",\
    "NOTIFICATION_SENT_ERROR": "Fehler beim Senden der Benachrichtigungen aufgetreten.",\
    "BLUETOOTH_DATA_SENT_ERROR": "Fehler beim Senden der Daten per Bluetooth aufgetreten.",\
    "BLUETOOTH_CONNECTED": "Verbindung erfolgreich hergestellt. Es wird nun eine Kommunikation mit dem Auto aufgebaut!",\
    "BLUETOOTH_NOT_CONNECTED": "Verbindung fehlgeschlagen.",\
    "PREPARATION": "Vorbereitung.. Bitte warten..",\
    "RESET_SUCCESSFULL": "OBD2-Dongle erfolgreich konfiguriert.",\
    "BLUETOOTH_CONNECTION_ERROR": "Es konnte keine Bluetooth-Verbindung mit dem Gerät hergestellt werden.",\
    "BLUETOOTH_DISABLED": "Bluetooth ist nicht aktiviert. Bitte Bluetooth einschalten!",\
    "STANDBY_MODE_ENABLED": "Überwachung beendet. OBD2-Dongle ist jetzt im StandBy-Modus. 12V-Batterie kann dennoch unter Umständen leer werden.",\
    "STANDBY_MODE_FAILED": "Etwas ist falsch gelaufen beim Stand-By-Modus.",\
    "UNSUPPORTED_CAR": "Nicht unterstützes Auto. Weitere Autos werden in Zukunft unterstützt werden.",\
    "UNSUPPORTED_DEVICE": "Das Gerät bzw. die Plattform wird nicht unterstützt. Eine Web-Version kommt in Zukunft.",\
    "SETTINGS_PASSWORD": "Passwort",\
    "SETTINGS_PASSWORD_TEXT": "Bitte gib Dein Passwort ein, um die Einstellungen zu speichern.",\
    "SET_SETTINGS_FAILED": "Speichern der Einstellungen fehlgeschlagen.",\
    "GET_SETTINGS_FAILED": "Holen der Einstellungen fehlgeschlagen.",\
    "SET_SETTINGS_SUCCESSFUL": "Die Einstellungen wurden erfolgreich gespeichert.",\
    "HEADER_SETTINGS": "Einstellungen",\
    "SETTINGS_ACCOUNT": "Benutzerkonto",\
    "SETTINGS_AKEY": "AKey",\
    "CHANGE_PASSWORD": "Passwort ändern",\
    "LANGUAGE": "Sprache",\
    "CONSUMPTION": "Verbrauch",\
    "CONSUMPTION_TEXT": "Gib Deinen durchschnittlichen Verbrauch an (kWh/100km)",\
    "NOTIFICATIONS": "Benachrichtigungen",\
    "EMAIL_NOTIFICATION": "E-Mail-Adresse",\
    "PUSH_NOTIFICATION": "Push-Benachrichtigung",\
    "TELEGRAM_NOTIFICATION": "Telegram-Benachrichtigung",\
    "TELEGRAM_MANAGE_NOTIFICATION": "Telegram-Verknüpfung verwalten",\
    "TELEGRAM_UNSUBSCRIBE": "Telegram-Benachrichtigung abwählen",\
    "TELEGRAM_UNSUBSCRIBE_TEXT": "Um keine Telegram-Benachrichtigungen mehr zu erhalten, dem \<a href=\\\"https://telegram.me/evnotifybot\\\"\>Telegram-Bot\<\/a\> einfach /unsubscribe schreiben.\
    Du kannst die Telegram-Benachrichtigungen jederzeit wieder aktivieren.",\
    "TELEGRAM_SUBSCRIBE": "Telegram-Benachrichtigungen aktivieren",\
    "TELEGRAM_SUBSCRIBE_TEXT": "Um Telegram-Benachrichtigungen zu aktivieren, schreibe dem \<a href=\\\"https://telegram.me/evnotifybot\\\"\>Telegram-Bot\<\/a\> einfach /subscribe.\
    Gib dabei den untenstehenden Token an. Diesen niemals an Dritte weitergeben! Am besten löschst Du nach der Einrichtigung die Textnachricht von Telegram mit dem Token.",\
    "SETTINGS_SOC_HELP": "Der gewünschte Ladezustand, bei dem die Benachrichtigungen verschickt werden sollen.",\
    "SETTINGS_SYSTEM": "System",\
    "SETTINGS_DEVICES": "Bluetooth-Gerät",\
    "SETTINGS_POLLING": "Abfrage-Intervall",\
    "SETTINGS_SYNC": "Automatische Synchronisierung",\
    "SETTINGS_CHARGINGERROR_DETECTION": "Ladeabbruchs-Erkennung",\
    "INTERVAL_0": "deaktiviert",\
    "INTERVAL_2": "alle 2 Sekunden",\
    "INTERVAL_5": "alle 5 Sekunden",\
    "INTERVAL_10": "alle 10 Sekunden",\
    "INTERVAL_15": "alle 15 Sekunden",\
    "INTERVAL_20": "alle 20 Sekunden",\
    "INTERVAL_30": "alle 30 Sekunden",\
    "INTERVAL_60": "jede Minute",\
    "INTERVAL_120": "alle 2 Minuten",\
    "INTERVAL_300": "alle 5 Minuten",\
    "INTERVAL_600": "alle 10 Minuten",\
    "INTERVAL_1800": "jede halbe Stunde",\
    "INTERVAL_3600": "jede Stunde",\
    "POLLING_WARNING": "Kurze Abfrage-Intervalle führen zu erhöhtem Akkuverbrauch, haben dafür aber eine bessere Genauigkeit.",\
    "SYNC_WARNING": "Kurze Synchronisierungs-Intervalle führen zu erhöhtem Datenverbrauch.",\
    "CHARGINGERROR_WARNING": "Kurze Fehlerkennungs-Intervalle können eventuell zu Falschmeldungen führen, informieren dafür aber am schnellsten über einen eventuellen Ladeabbruch.",\
    "SWITCH_ACCOUNT": "Account wechseln",\
    "SWITCH_ACCOUNT_TEXT": "Verbinde beliebig viele Geräte miteinander. Einfach mit einem bestehenden Account hier anmelden. Dazu den AKey des zu nutzenden Accounts angeben.",\
    "SYNC_SETTINGS_FAILED": "Synchronisation fehlgeschlagen.",\
    "SYNC_SETTINGS_SUCCESSFUL": "Synchronisation erfolgreich.",\
    "SWITCH_ACCOUNT_SUCCESSFUL": "Account erfolgreich gewechselt.",\
    "SYNC": "Einstellungen synchronisieren",\
    "SYNC_TEXT": "Du hast hier die Möglichkeit, manuell die Einstellungen zu synchronisieren. Du kannst Dir entweder die aktuellen Einstellungen holen oder diese für verknüpfte Geräte setzen. Dies kann existierende Einstellungen überschreiben!",\
    "SYNC_TYPE_PULL": "Einstellungen holen",\
    "SYNC_TYPE_PUSH": "Einstellungen setzen",\
    "SAVE_SETTINGS": "Einstellungen speichern",\
    "SYNC_MODE_DISABLED": "Auto-Sync ist nicht aktiviert.",\
    "SYNC_MODE_AUTO": "Auto-Sync aktiv. Modus: Automatischer Wechsel",\
    "SYNC_MODE_UPLOAD": "Auto-Sync aktiv. Modus: Nur Ladezustand senden",\
    "SYNC_MODE_DOWNLOAD": "Auto-Sync aktiv. Modus: Nur Ladezustand empfangen"\
}');
