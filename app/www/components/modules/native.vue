<script>
function noop() {}

function getCordova() {
    return ((typeof window !== 'undefined') ? window.cordova : undefined);
}

function getFirebasePlugin() {
    if (typeof window === 'undefined') return undefined;
    return window.FirebasePlugin || window.FCMPlugin;
}

function getLocalNotificationPlugin() {
    var cordova = getCordova();

    return (cordova && cordova.plugins && cordova.plugins.notification) ? cordova.plugins.notification.local : undefined;
}

function getBackgroundModePlugin() {
    var cordova = getCordova();

    return (cordova && cordova.plugins) ? cordova.plugins.backgroundMode : undefined;
}

function getAutoStartPlugin() {
    var cordova = getCordova();

    return (cordova && cordova.plugins) ? cordova.plugins.autoStart : undefined;
}

function getInsomniaPlugin() {
    if (typeof window === 'undefined' || !window.plugins) return undefined;

    return window.plugins.insomnia;
}

function getLaunchNavigatorPlugin() {
    if (typeof window === 'undefined') return undefined;

    return window.launchnavigator;
}

function getAndroidPermissionsPlugin() {
    var cordova = getCordova();

    return (cordova && cordova.plugins) ? cordova.plugins.permissions : undefined;
}

function logPluginError(err) {
    if (typeof console !== 'undefined' && console && typeof console.error === 'function') console.error(err);
}

export default {
    isCordova: function () {
        return !!getCordova();
    },
    isApplePlatform: function (platform) {
        return (typeof platform === 'string' && (platform.indexOf('ios') !== -1 || platform.indexOf('mac') !== -1));
    },
    requestNotificationPermission: function (success, error) {
        var plugin = getLocalNotificationPlugin();

        if (!plugin || typeof plugin.requestPermission !== 'function') return (success || noop)(true);
        plugin.requestPermission((success || noop), (error || noop));
    },
    requestBluetoothPermissions: function (success, error) {
        var permissions = getAndroidPermissionsPlugin();
        var platform = (window.device && typeof window.device.platform === 'string') ? window.device.platform.toLowerCase() : '';
        var onSuccess = success || noop;
        var onError = error || noop;
        var androidVersion = (typeof window.device !== 'undefined') ? parseInt(window.device.version, 10) : 0;
        var permissionList = [];
        var verifyPermissionList = [];
        var verifyPermissions = function(index) {
            if (index >= verifyPermissionList.length) return onSuccess();
            permissions.checkPermission(verifyPermissionList[index], function(status) {
                if (status && status.hasPermission) verifyPermissions(index + 1);
                else onError(status);
            }, onError);
        };

        if (platform !== 'android') return onSuccess();
        if (!permissions || typeof permissions.checkPermission !== 'function' || typeof permissions.requestPermissions !== 'function') {
            return onError(new Error('cordova-plugin-android-permissions is unavailable'));
        }
        if (androidVersion >= 12) {
            permissionList.push('android.permission.BLUETOOTH_CONNECT');
            verifyPermissionList.push('android.permission.BLUETOOTH_CONNECT');
        } else {
            permissionList.push('android.permission.ACCESS_FINE_LOCATION');
            verifyPermissionList.push('android.permission.ACCESS_FINE_LOCATION');
        }

        permissions.requestPermissions(permissionList, function(requestStatus) {
            if (!(requestStatus && requestStatus.hasPermission)) return onError(requestStatus);
            verifyPermissions(0);
        }, onError);
    },
    setPersistentNotificationDefaults: function (defaults) {
        var plugin = getLocalNotificationPlugin();

        if (plugin && typeof plugin.setDefaults === 'function') plugin.setDefaults(defaults);
    },
    schedulePersistentNotification: function (notification) {
        var plugin = getLocalNotificationPlugin();

        if (plugin && typeof plugin.schedule === 'function') plugin.schedule(notification);
    },
    updatePersistentNotification: function (notification) {
        var plugin = getLocalNotificationPlugin();

        if (plugin && typeof plugin.update === 'function') plugin.update(notification);
        else if (plugin && typeof plugin.schedule === 'function') plugin.schedule(notification);
    },
    clearPersistentNotifications: function () {
        var plugin = getLocalNotificationPlugin();

        if (plugin && typeof plugin.clearAll === 'function') plugin.clearAll();
    },
    onBackgroundActivate: function (callback) {
        var plugin = getBackgroundModePlugin();

        if (plugin && typeof plugin.on === 'function') plugin.on('activate', callback);
    },
    disableBackgroundWebViewOptimizations: function () {
        var plugin = getBackgroundModePlugin();

        if (plugin && typeof plugin.disableWebViewOptimizations === 'function') plugin.disableWebViewOptimizations();
    },
    enableBackgroundMode: function (defaults) {
        var plugin = getBackgroundModePlugin();

        if (!plugin) return;
        if (typeof plugin.enable === 'function') plugin.enable();
        if (defaults && typeof plugin.setDefaults === 'function') plugin.setDefaults(defaults);
    },
    disableBackgroundMode: function () {
        var plugin = getBackgroundModePlugin();

        if (plugin && typeof plugin.disable === 'function') plugin.disable();
    },
    configureBackgroundMode: function (defaults) {
        var plugin = getBackgroundModePlugin();

        if (!plugin) return;
        if (typeof plugin.configure === 'function') plugin.configure(defaults);
        else if (typeof plugin.setDefaults === 'function') plugin.setDefaults(defaults);
    },
    subscribeToPushTopic: function (topic) {
        var plugin = getFirebasePlugin();

        if (!plugin || !topic) return;
        if (typeof plugin.subscribeToTopic === 'function') return plugin.subscribeToTopic(topic);
        if (typeof plugin.subscribe === 'function') return plugin.subscribe(topic, noop, logPluginError);
        if (plugin.messaging && typeof plugin.messaging.subscribe === 'function') return plugin.messaging.subscribe(topic, noop, logPluginError);
    },
    unsubscribeFromPushTopic: function (topic) {
        var plugin = getFirebasePlugin();

        if (!plugin || !topic) return;
        if (typeof plugin.unsubscribeFromTopic === 'function') return plugin.unsubscribeFromTopic(topic);
        if (typeof plugin.unsubscribe === 'function') return plugin.unsubscribe(topic, noop, logPluginError);
        if (plugin.messaging && typeof plugin.messaging.unsubscribe === 'function') return plugin.messaging.unsubscribe(topic, noop, logPluginError);
    },
    setKeepAwake: function (enabled) {
        var plugin = getInsomniaPlugin();

        if (!plugin) return;
        if (enabled && typeof plugin.keepAwake === 'function') plugin.keepAwake();
        if (!enabled && typeof plugin.allowSleepAgain === 'function') plugin.allowSleepAgain();
    },
    setAutoStart: function (enabled) {
        var plugin = getAutoStartPlugin();

        if (!plugin) return;
        if (enabled && typeof plugin.enable === 'function') plugin.enable();
        if (!enabled && typeof plugin.disable === 'function') plugin.disable();
    },
    navigateToCoordinates: function (latitude, longitude) {
        var plugin = getLaunchNavigatorPlugin();

        if (plugin && typeof plugin.navigate === 'function') plugin.navigate([latitude, longitude]);
    }
}
</script>
