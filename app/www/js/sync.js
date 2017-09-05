/**
 * Function to sync data - receives and sends data depended on current app state
 * NOTE: receives data if app does not communicate with car.
 *          If app communicates with car and receives data it pushes the state of charge to the server instead
 */
var startSync = function(interval) {
    var syncData = function() {
        // push or pull data based if car currently communicates or not and sync curMode type
        if((RUNNING_INTERVAL && SYNC_MODE === 'auto') || SYNC_MODE === 'upload') {  // push
            // check if the state of charge changes
            if(getValue('lastSoC') >= 0 && getValue('lastSoC') !== LAST_SOC) {
                // push soc
                sendRequest('syncSoC', {akey: getValue('akey'), token: getValue('token'), soc: LAST_SOC = parseInt(getValue('lastSoC'))}, function(err, syncRes) {
                    if(err) console.log(err);   // fail silently
                });
            }
        } else if(SYNC_MODE === 'download' || SYNC_MODE === 'auto'){    // pull
            // receive settings and state of charge
            sendRequest('sync', {akey: getValue('akey'), token: getValue('token'), type: 'pull'}, function(err, syncRes) {
                if(!err && syncRes && syncRes.syncRes) {
                    var settings = JSON.parse(getValue('config', '{}'));

                    // overwrite specific keys
                    settings.email = syncRes.syncRes.email;
                    settings.telegram = syncRes.syncRes.telegram;
                    settings.soc = syncRes.syncRes.soc;
                    settings.curSoC = syncRes.syncRes.curSoC;
                    settings.polling = syncRes.syncRes.polling;
                    settings.autoSync = syncRes.syncRes.autoSync;
                    settings.lng = syncRes.syncRes.lng;
                    settings.push = syncRes.syncRes.push;
                    // save new settings
                    setValue('config', settings);
                    if(settings.lng !== getValue('lng')) translatePage(setValue('lng', settings.lng));
                    if(!settings.autoSync) clearInterval(RUNNING_SYNC);
                    // display the remotly fetched state of charge
                    if(socCycle) socCycle.animate(((settings.curSoC === 100)? 1 : '0.' + parseInt(settings.curSoC)));
                } else console.log(err);    // fail silently
            });
        }
    };

    // clear may existing syncs
    if(RUNNING_SYNC) clearInterval(RUNNING_SYNC);
    // start sync
    syncData(); // once before interval
    toggleAutoSyncMode();
    RUNNING_SYNC = setInterval(function () {
        syncData();
    }, ((interval)? interval : 60) * 1000);
};

/**
 * [description]
 * @param  {[type]} curMode [description]
 * @return {[type]}      [description]
 */
var toggleAutoSyncMode = function(curMode) {
    var cloudIcon = document.getElementById('cloudIcon'),
        lng = getValue('lng', 'en'),
        skipConnect = ((curMode)? false : true),
        autoSyncOn = JSON.parse(getValue('config', '{}')).autoSync,
        curMode = ((autoSyncOn)? ((curMode)? ((curMode === 'download')? SYNC_MODE = 'upload' : SYNC_MODE = 'download') : SYNC_MODE = 'auto') : SYNC_MODE = 'disabled'),   // determine curMode
        icons = {download: '&#xE2C0;', upload: '&#xE2C3;', auto: '&#xE2BF;', disabled: '&#xE2C1;'},
        /**
         * Function which shows message on the snackbar
         * @param  {String} text The text to show
         * @return {Object}     returns global window
         */
        showMessage = function(text) {
            var infoMessage = $('#infoMessage')[0].MaterialSnackbar.showSnackbar({
                message: text,
                duration: 2222
            });
            return this;
        };

    // toggle curMode
    if(cloudIcon) {
        cloudIcon.innerHTML = icons[curMode];
        if(typeof socCycle !== 'undefined') socCycle.animate(0); // reset cycle
        if(curMode === 'download') {
            stopWatch();    // stop connection
        } else if((curMode === 'upload' || curMode === 'auto') && !skipConnect) {
            // re-establish connection, maybe directly in startWatch?!
            if(typeof bluetooth !== 'undefined') {
                bluetooth.setInfoState('searching');
                bluetooth.isEnabled(function(enabled) {
                    if(enabled) {
                        // check if connection already established
                        bluetooth.isConnected(function(connected) {
                            if(!connected) {
                                // connect to device
                                bluetooth.connect(JSON.parse(getValue('config', '{}')).device, function(err, connected) {
                                    if(!err && connected) {
                                        showMessage(translate('BLUETOOTH_CONNECTED', lng)).bluetooth.setInfoState('connected');
                                        startWatch();
                                    } else showMessage(translate('BLUETOOTH_NOT_CONNECTED', lng)).bluetooth.setInfoState('failed');
                                });
                            } else {
                                showMessage(translate('BLUETOOTH_CONNECTED', lng)).bluetooth.setInfoState('connected');
                                startWatch();
                            }
                        });
                    } else showMessage(translate('BLUETOOTH_DISABLED', lng)).bluetooth.setInfoState('disabled');
                });
            }
        }
        showMessage(translate('SYNC_MODE_' + curMode.toUpperCase(), lng));
    }
};
