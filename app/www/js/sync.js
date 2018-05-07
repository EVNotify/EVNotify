/**
 * Function to sync data - receives and sends data depended on current app state
 * NOTE: receives data if app does not communicate with car.
 *          If app communicates with car and receives data it pushes the state of charge to the server instead
 */
var startSync = function(interval) {
    var syncData = function() {
        // push or pull data based if car currently communicates or not and sync curMode type
        if((RUNNING_INTERVAL && SYNC_MODE === 'auto') || SYNC_MODE === 'upload') {  // push
            // push soc
            sendRequest('syncSoC', {akey: getValue('akey'), token: getValue('token'), soc: LAST_SOC = parseInt(getValue('lastSoC'))}, function(err, syncRes) {
                if(err) console.log(err);   // fail silently
            });
        } else if(SYNC_MODE === 'download' || SYNC_MODE === 'auto'){    // pull
            // receive settings and state of charge
            sendRequest('sync', {akey: getValue('akey'), token: getValue('token'), type: 'pull'}, function(err, syncRes) {
                if(!err && syncRes && syncRes.syncRes) {
                    var settings = JSON.parse(getValue('config', '{}'));

                    // overwrite specific keys
                    settings.email = syncRes.syncRes.email;
                    settings.telegram = syncRes.syncRes.telegram;
                    settings.soc = syncRes.syncRes.soc;
                    settings.curSoC = parseInt(syncRes.syncRes.curSoC);
                    settings.autoSync = syncRes.syncRes.autoSync;
                    settings.lng = syncRes.syncRes.lng;
                    settings.push = syncRes.syncRes.push;
                    // save new settings
                    setValue('config', settings);
                    setValue('consumption', syncRes.syncRes.consumption);
                    if(settings.lng !== getValue('lng')) translatePage(setValue('lng', settings.lng));
                    if(!settings.autoSync) clearInterval(RUNNING_SYNC);
                    // display the remotly fetched state of charge and update charging information
                    if(typeof updateChargingInfo !== 'undefined') updateChargingInfo(settings.curSoC, syncRes.syncRes.lastSoC);
                } else console.log(err);    // fail silently
            });
        }
    };

    // clear may existing syncs
    if(RUNNING_SYNC) clearInterval(RUNNING_SYNC);
    // start sync
    syncData(); // once before interval
    // toggleAutoSyncMode();
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
        origMode = curMode,
        curMode = ((autoSyncOn)? ((curMode)? ((curMode === 'download')? SYNC_MODE = 'upload' : SYNC_MODE = 'download') : SYNC_MODE = 'auto') : SYNC_MODE = 'disabled'),   // determine curMode
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
        cloudIcon.src = './icons/cloud_' + curMode + '.svg';
        if(typeof updateChargingInfo !== 'undefined') updateChargingInfo(0);    // reset charging information and cycle
        if(curMode === 'download') {
            stopWatch();    // stop connection
        } else if((curMode === 'upload' || curMode === 'auto') && !skipConnect) {
            // re-establish connection
            if(typeof bluetooth !== 'undefined') bluetooth.establishConnection(JSON.parse(getValue('config', '{}')).device);
        }
        // apply the mode for default sync mode on re-start
        if(origMode) setValue('syncMode', origMode);
        else removeValue('syncMode');
        // directly call sync request again
        startSync(JSON.parse(getValue('config', '{}')).autoSync);

        showMessage(translate('SYNC_MODE_' + curMode.toUpperCase(), lng));
    }
};
