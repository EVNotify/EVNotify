/**
 * Function to sync data - receives and sends data depended on current app state
 * NOTE: receives data if app does not communicate with car.
 *          If app communicates with car and receives data it pushes the state of charge to the server instead
 */
var startSync = function(interval) {
    var syncData = function() {
        // push or pull data based if car currently communicates or not
        if(RUNNING_INTERVAL) {  // push
            // check if the state of charge changes
            if(getValue('lastSoC') >= 0 && getValue('lastSoC') !== LAST_SOC) {
                // push soc
                sendRequest('syncSoC', {akey: getValue('akey'), token: getValue('token'), soc: LAST_SOC = parseInt(getValue('lastSoC'))}, function(err, syncRes) {
                    if(err) console.log(err);   // fail silently
                });
            }
        } else {    // pull
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
    RUNNING_SYNC = setInterval(function () {
        syncData();
    }, ((interval)? interval : 60) * 1000);
};
