/**
 * Function to begin with state of charge monitoring
 */
function startWatch() {
    var config = JSON.parse(getValue('config', '{}'));

    watchSoC(config.device, config.car, config.soc, config.polling, config.errorDetection);
}

/**
 * Function to stop the state of charge monitoring
 * @param  {Function} callback  callback function
 * @return {void}
 */
function stopWatch(callback) {
    if(RUNNING_INTERVAL) clearInterval(RUNNING_INTERVAL);

    // try to unsubscribe to prevent multiple listeners
    try {
        bluetoothSerial.unsubscribeRawData();
        bluetooth.disconnect(function(disconnected) {
            console.log('Disconnected: ' + disconnected);
            if(typeof callback === 'function') callback(true);
        });
    } catch (e) {if(typeof callback === 'function') callback(false);}
}

/**
 * Enables standBy mode which stops monitoring and turns the obd2 dongle in low power mode
 * @return {void}
 */
function standBy() {
    /**
     * Function which shows message on the snackbar
     * @param  {String} text The text to show
     */
    var showMessage = function(text) {
        var infoMessage = $('#infoMessage')[0].MaterialSnackbar.showSnackbar({
            message: text,
            duration: 2222
        });
    };

    // ensure that required variables are available
    if(typeof window.cordova !== 'undefined' && typeof window.bluetoothSerial !== 'undefined' && typeof bluetooth !== 'undefined') {
        // stop watch
        stopWatch(function(disconnected) {
            if(disconnected) {
                bluetooth.sendCommand('ATLP');  // turn dongle in stand by mode
                showMessage(translate('STANDBY_MODE_ENABLED', getValue('lng', 'en')));
                // dark mode
                darkMode(true, 'index');
                // reset values
                socCycle.animate(0);
                updateChargingInfo(0);
            } else showMessage(translate('STANDBY_MODE_FAILED', getValue('lng', 'en')));
        });
    }
}

/**
 * Function which enables or disables the debug mode
 */
function toggleDebug() {
    /**
     * Function which shows message on the snackbar
     * @param  {String} text The text to show
     */
    var showMessage = function(text) {
        var infoMessage = $('#infoMessage')[0].MaterialSnackbar.showSnackbar({
            message: text,
            duration: 2222
        });
    };

    if(DEBUG) {
        DEBUG = false;
        showMessage(translate('DEBUG_MODE_DISABLED', getValue('lng', 'en')));
    } else {
        showMessage(translate('DEBUG_MODE_ENABLED', getValue('lng', 'en')));
        DEBUG = true;
    }
}

/**
 * Function which handles the bluetooth connection and communication with the car and sends the notifications
 * @param  {String} device      the device uuid/adress of the OBD2-Dongle
 * @param  {String} car         the car (EVNotify will support more cars soon)
 * @param  {Number} soc         the soc value on which the user should be notified
 * @param  {Number} interval    the given interval to check for new soc
 * @param  {Number} errorinterval   the given interal to check for charging errors / interrupts to notify user
 */
function watchSoC(device, car, soc, interval, errorinterval) {
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
            // check if connected
            bluetooth.isConnected(function(connected) {
                if(connected) {
                    showMessage(translate('PREPARATION', lng));
                    resetDongle(function(err, resetted) {
                        if(!err && resetted) {
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
                                    // parse and round to integer
                                    converted = parseInt(converted);
                                    if(converted >= 0 && converted <= 100) {
                                        // reset block data and raw data again
                                        BLOCKDATA = '';
                                        RAWDATA = '';
                                        // set last successfull car response to current time
                                        LAST_CAR_ACTIVITY = new Date().getTime() / 1000;
                                        // save soc locally
                                        setValue('lastSoC', converted);
                                        // animate the soc in the cycle
                                        socCycle.animate(((converted === 100)? 1 : '0.' + ((converted < 10)? '0' + converted : converted)));
                                        // update charging information list
                                        updateChargingInfo(converted);
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

                            // send command once
                            bluetooth.sendCommand(SOC_CMD[car], function(err, sent) {
                                if(err) showMessage(translate('BLUETOOTH_DATA_SENT_ERROR', lng));
                            });

                            // send command to car in the given interval
                            RUNNING_INTERVAL = setInterval(function () {
                                /**
                                 * determine and check the last car activity to ensure that
                                 * the car response is good - if there was a charging error or a connection error
                                 * send a notification to user and inform it about the issue
                                 */
                                 if(LAST_CAR_ACTIVITY && errorinterval && (new Date().getTime() / 1000 > LAST_CAR_ACTIVITY  + errorinterval) && !NOTIFICATION_SENT) {
                                     bluetooth.setInfoState('unknown');
                                     // send error notification
                                     sendRequest('notification', {akey: getValue('akey'), token: getValue('token'), error: true}, function(err, notificationRes) {
                                         if(err) showMessage(translate('NOTIFICATION_SENT_ERROR', lng));
                                         else NOTIFICATION_SENT = true;
                                     });
                                 }

                                /**
                                 * determine if connection is still established.
                                 * If not, reconnect to prevent no car response and notification error message send
                                 */
                                bluetooth.isConnected(function(connected) {
                                    if(connected) {
                                        bluetooth.setInfoState('connected');
                                        bluetooth.sendCommand(SOC_CMD[car], function(err, sent) {
                                            if(err) showMessage(translate('BLUETOOTH_DATA_SENT_ERROR', lng));
                                        });
                                    } else {
                                        bluetooth.setInfoState('searching');
                                        bluetooth.connect(device, function(err, connected) {
                                            if(!err && connected) {
                                                bluetooth.setInfoState('connected');
                                                bluetooth.sendCommand(SOC_CMD[car], function(err, sent) {
                                                    if(err) showMessage(translate('BLUETOOTH_DATA_SENT_ERROR', lng));
                                                });
                                            } else {
                                                showMessage(translate('BLUETOOTH_NOT_CONNECTED', lng));
                                                bluetooth.setInfoState('failed');
                                            }
                                        });
                                    }
                                });
                            }, ((interval)? interval : 60) * 1000);
                        } else showMessage(translate(err), lng);
                    });
                } else showMessage(translate('BLUETOOTH_NOT_CONNECTED', lng));
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
    // track the raw data
    RAWDATA += data;
    if(DEBUG) $('#debugData').append('RAW DATA: ' + data + '<br>');
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
        // cut out eventually spaces before or after BLOCKDATA
        BLOCKDATA = BLOCKDATA.trim();
        // 4: - last byte before 5: (new calculation removes spaces and concats them in pairs together to avoid wrong calculation)
        callback(parseInt(BLOCKDATA.substr(BLOCKDATA.indexOf('4:') +2, BLOCKDATA.lastIndexOf(':') ).replace(/\s/g, '').match(/.{1,2}/g)[6], 16)/ 2);
    } else callback(-1);

    // trim and cut out spaces of raw data
    RAWDATA = RAWDATA.trim().replace(/\s/g, '');

    // detect interface errors - re-initialize the obd interface again
    if(RAWDATA.indexOf('CANERROR') !== -1 || RAWDATA.indexOf('STOPPED') !== -1 || RAWDATA.indexOf('UNABLETOCONNECT') !== -1) {
        resetDongle(function(err, reset) {
            RAWDATA = '';   // reset raw data tracking
        });
    }
}

/**
 * Function which resets dongle to force specific format settings for dongle and re-initialization of obd2-interface
 * @param {Function} callback   callback function
 */
function resetDongle(callback) {
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
    lng = getValue('lng', 'en'),
    /**
     * callbackHandler for command step - checks if error occurred or not
     * @param  {String} message the message to validate
     * @return {void}
     */
    callbackHandler = function(message) {
        showMessage(translate(message, lng));
        if(message === 'RESET_SUCCESSFULL') callback(null, true);
        else callback(message, false);
    };

    //TODO: beautify this......
    bluetooth.isConnected(function(connected) {
        if(connected) {
            // reset dongle
            bluetooth.sendCommand('ATD', function(err, sent) {
                if(!err) {
                    bluetooth.sendCommand('ATZ', function(err, sent) {
                        if(!err) {
                            bluetooth.sendCommand('ATE0', function(err, sent) {
                                if(!err) {
                                    bluetooth.sendCommand('ATL0', function(err, sent) {
                                        if(!err) {
                                            bluetooth.sendCommand('ATS0', function(err, sent) {
                                                if(!err) {
                                                    bluetooth.sendCommand('ATH0', function(err, sent) {
                                                        if(!err) {
                                                            bluetooth.sendCommand('ATSP0', function(err, sent) {
                                                                if(!err) {
                                                                    bluetooth.sendCommand('ATSTFF', function(err, sent) {
                                                                        if(!err) {
                                                                            callbackHandler('RESET_SUCCESSFULL');
                                                                        } else callbackHandler('BLUETOOTH_DATA_SENT_ERROR');
                                                                    });
                                                                } else callbackHandler('BLUETOOTH_DATA_SENT_ERROR');
                                                            });
                                                        } else callbackHandler('BLUETOOTH_DATA_SENT_ERROR');
                                                    });
                                                } else callbackHandler('BLUETOOTH_DATA_SENT_ERROR');
                                            });
                                        } else callbackHandler('BLUETOOTH_DATA_SENT_ERROR');
                                    });
                                } else callbackHandler('BLUETOOTH_DATA_SENT_ERROR');
                            });
                        } else callbackHandler('BLUETOOTH_DATA_SENT_ERROR');
                    });
                } else callbackHandler('BLUETOOTH_DATA_SENT_ERROR');
            });
        } else callbackHandler('BLUETOOTH_NOT_CONNECTED');
    });
}

/**
 * Function which updates charging information based on given state of charge (and timestamp)
 * NOTE: updates timestamp, range and duration
 * @param  {Number} soc        the state of charge
 * @param  {Number} timestamp  optional given timestamp (in UNIX time)
 * @return {void}
 */
function updateChargingInfo(soc, timestamp) {
    var timestampWidget = document.getElementById('charginginfo_timestamp'),
        rangeWidget = document.getElementById('charginginfo_range'),
        durationWidget = document.getElementById('charginginfo_duration'),
        /**
         * Function which formats given date to specific DD.MM.YYYY hh:mm format
         * @param  {Date} date  the date to format
         * @return {String}     the formatted date string
         */
        formatDate = function(date) {
            if(!(date instanceof Date)) return '?';
            var hours = date.getHours(),
                minutes = date.getMinutes();

            minutes = ((minutes < 10)? '0' + minutes : minutes); // correct low values

            return date.getDate() + '.' + parseInt(date.getMonth() + 1) + '.' + date.getFullYear() + ' ' + hours + ':' + minutes;
        };

    // update information
    if(timestampWidget && rangeWidget && durationWidget) {
        timestampWidget.innerText = formatDate(((timestamp)? new Date(timestamp * 1000) : new Date()));
        rangeWidget.innerText = calculateEstimatedRange(soc);
        durationWidget.innerText = calculateEstimatedDuration(soc);
    }
}

/**
 * Function which calculates estimated range for given state of charge based on manual consumption value
 * @param  {Number} soc     the state of charge to calculate the range for
 * @return {String}         formatted string for estimated range
 */
function calculateEstimatedRange(soc) {
    if(typeof soc !== 'number') return '?';
    // TODO calulcation based on car
    if(soc < 10) soc = '0' + soc.toString();    // correct low values
    return parseInt((28 / getValue('consumption', 13)) * 100 * ((soc === 100)? 1 : '0.' + soc)) + 'km / ' + // current
        parseInt((28 / getValue('consumption', 13)) * 100) + 'km';  // total
    // TODO automate this later..
}

/**
 * Function which calculates estimated charging time duration for given state of charge based on manual charging speed
 * @param  {Number} soc     the state of charge to calculate the time for
 * @return {String}         formatted string for estimated range
 */
function calculateEstimatedDuration(soc) {
    // TODO based on car and charging speed
    return '?'; // TODO
    // TODO automate this later..
}
