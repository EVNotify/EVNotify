/**
 * Function which handles the bluetooth connection and communication with the car and sends the notifications
 * @param  {Object} device      the device object containing name and uuid/adress of the OBD2-Dongle
 * @param  {String} car         the car (EVNotify will support more cars soon)
 * @param  {Integer} soc        the soc value on which the user should be notified
 * @param  {Integer} interval   the given interval to check for new soc
 */
function watchSoC(device, car, soc, interval) {
    /**
     * Function which shows message on the snackbar
     * @param  {String} text The text to show
     */
    var showMessage = function(text) {
        var infoMessage = $('#infoMessage')[0].MaterialSnackbar.showSnackbar({
            message: text,
            duration: 2222
        });
    },
    lng = getValue('lng', 'en');

    // ensure that required variables are available
    if(typeof window.cordova !== 'undefined' && typeof window.bluetoothSerial !== 'undefined' && typeof bluetooth !== 'undefined') {
        // check if car is supported
        if(typeof SOC_CMD[car] !== 'undefined') {
            // check if bluetooth is enabled
            bluetooth.isEnabled(function(enabled) {
                if(enabled) {
                    // connect to device
                    bluetooth.connect(device.id, function(err, connected) {
                        if(!err && connected) {
                            /**
                             * subscribe to raw data and handle incoming data
                             * NOTE: The data comes partially and as it looks randomly.
                             * So there is no clear structure and defined amount of how often raw data receives
                             * NOTE: We have to use super global variables because the subscribeRawData function
                             * doesn't "know" older variables, the references are lost, so we need to use kind of a hack
                             */
                            bluetoothSerial.subscribeRawData(function(data) {
                                var bytes = new Uint8Array(data),
                                    decoded = new TextDecoder('utf-8').decode(bytes);

                                if(DEBUG) $('#debugInfo').append(decoded + '<br>NEXT<br>');
                                // send data to convertSoC function to retrieve the converted soc
                                convertSoC(decoded, function(converted) {
                                    // debug only
                                    if(converted >= 0 && converted <= 100) {
                                        showMessage(translate('CHARGING_STATE', lng) + converted + '%');
                                        // reset block data again
                                        BLOCKDATA = '';
                                        // animate the soc in the cycle
                                        socCycle.animate(((converted == 100)? 1 : '0.' + parseInt(converted)));
                                        // check if the desired soc value was achieved
                                        if(converted >= soc && !NOTIFICATION_SENT) {
                                            // send notification request
                                            sendRequest('notification', {akey: getValue('akey'), token: getValue('token')}, function(err, notificationRes) {
                                                if(err) showMessage(translate('NOTIFICATION_SENT_ERROR', lng));
                                                else NOTIFICATION_SENT = true;
                                            });
                                        }
                                    }
                                });
                            });

                            // send command to car in the given interval
                            setInterval(function () {
                                bluetooth.sendCommand(SOC_CMD[car], function(err, sent) {
                                    if(err) showMessage(translate('BLUETOOTH_DATA_SENT_ERROR', lng));
                                });
                            }, ((interval)? interval : 60) * 1000);
                        } else showMessage(translate('BLUETOOTH_CONNECTION_ERROR', lng));
                    });
                } else showMessage(translate('BLUETOOTH_DISABLED', lng));
            });
        } else showMessage(translate('UNSUPPORTED_CAR', lng));
    } else showMessage(translate('UNSUPPORTED_DEVICE', lng));
}

/**
 * Function which converts the received, partial data from the car
 * NOTE: It collects the data as long as the data can be decoded to the soc value
 * Requires super global variables, otherwise it doesn't have the references from prior data
 * because the subscribeRawData losts references of all variables..
 * NOTE: As long as the data could not be converted, the function returns -1.
 * Otherwise the calculated soc will be returned in the callback
 * @param  {String}   data     the decoded (partial) data from the car
 * @param  {Function} callback callback function
 */
function convertSoC(data, callback) {
    // return parseInt(data.substr(data.indexOf('4:')).split(' ')[7], 16) / 2;
    if(BLOCKDATA) {
        BLOCKDATA += ' ' + data;
        if(DEBUG) $('#debugData').append('CONTINUE WITH BLOCK' + '<br>');
    }

    if(data && data.indexOf('4:') !== -1) {
        if(DEBUG) $('#debugData').append('FOUND BEGINNING' + '<br>');
        BLOCKDATA += data;
    }

    if(data && data.indexOf('5:') !== -1) {
        if(DEBUG) $('#debugData').append('FOUND END' + '<br>');
        if(DEBUG) $('#debugData').append('DATA END: ' + BLOCKDATA + '<br>');
        // 4: - last byte before 5:
        callback(parseInt(BLOCKDATA.substr(BLOCKDATA.indexOf('4:')).split(' ')[7], 16) / 2);
    } else callback(-1);
}
