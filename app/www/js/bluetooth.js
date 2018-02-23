/**
 * Bluetooth handler - easier and beautified callbacks
 * NOTE: requires cordova and the bluetoothSerial plugin
 */
if(typeof window.cordova !== 'undefined' && typeof window.bluetoothSerial !== 'undefined') {
    var bluetooth = {
        /**
         * Function which returns whether or not bluetooth is enabled
         * @param  {Function} callback callback function
         */
        isEnabled: function(callback) {
            bluetoothSerial.isEnabled(function() {
                if(typeof callback === 'function') callback(true);
            }, function() {
                if(typeof callback === 'function') callback(false);
            });
        },
        /**
         * Function which returns whether or not a device is connected
         * @param  {Function} callback callback function
         */
        isConnected: function(callback) {
            bluetoothSerial.isConnected(function() {
                if(typeof callback === 'function') callback(true);
            }, function() {
                if(typeof callback === 'function') callback(false);
            });
        },
        /**
         * Function which unsubscribes from raw data subscribtion
         * and informs whether or not the unsubscribtion was successfull
         * NOTE: the subscribtion has to be done with bluetoothSerial directly
         * because the function declarations must be there
         * @param  {Function} callback callback function
         */
        unsubscribe: function(callback) {
            bluetoothSerial.unsubscribeRawData(function() {
                if(typeof callback === 'function') callback(true);
            }, function() {
                if(typeof callback === 'function') callback(false);
            });
        },
        /**
         * Function which lists paired devices
         * @param  {Function} callback callback function
         */
        list: function(callback) {
            bluetoothSerial.list(function(devices) {
                if(typeof callback === 'function') callback(null, devices);
            }, function(err) {
                if(typeof callback === 'function') callback(err, null);
            });
        },
        /**
         * Function which connects to specified device and returns the connection state
         * @param  {String}   device   the device to connect (must be a valid id/adress fetched from list() function)
         * @param  {Function} callback callback function
         */
        connect: function(device, callback) {
            bluetoothSerial.connect(device, function() {
                if(typeof callback === 'function') callback(null, true);
            }, function(err) {
                if(typeof callback === 'function') callback(err, false);
            });
        },
        /**
         * Function which sends given command to device (obd2 dongle)
         * NOTE: Every command to the car needs to have a carriage return
         * The function automatically adds this to the command
         * NOTE: This function returns only if write was successfull.
         * To get the data, you have to subscribe previously (to raw data)
         * @param  {String}   command  the command to send (WITHOUT carriage return)
         * @param  {Function} callback callback function
         */
        sendCommand: function(command, callback) {
            bluetoothSerial.write(command + '\r', function() {
                if(typeof callback === 'function') callback(null, true);
            }, function(err) {
                if(typeof callback === 'function') callback(err, false);
            });
        },
        /**
         * Function which sends given commands to device (obd2 dongle)
         * NOTE: It uses the sendCommand function for every command
         * It only fires the callback on last command and returns all errors, which occured, if any
         * @param  {Array}   commands   the commands to send
         * @param  {Function} callback  callback function
         * @return {void}
         */
        sendCommands: function(commands, callback) {
            var self = this,
                errors = [],
                /**
                 * Sends next command from commands array with delay between and fires callback on last command
                 * @param  {Number} cnt current offset of commands Array
                 * @return {void}
                 */
                sendNextCommand = function(cnt) {
                    // send one command
                    self.sendCommand(commands[cnt], function(err, sent) {
                        if(err) errors.push(err);   // register error
                    });
                    setTimeout(function () {
                        if(cnt + 1 === commands.length && typeof callback === 'function') {
                            // last command was sent, inform wheter all commands were successfull or if errors occured
                            callback(((errors.length)? errors : null), ((errors.length)? false : true));
                        } else sendNextCommand(++cnt);
                    }, 500);
                };

            if(commands && typeof commands.forEach === 'function' && commands.length) {
                // send commands delayed NOTE Maybe we should wait for OK from OBD instead of timeout..
                sendNextCommand(0);
            } else if(typeof callback === 'function') callback(null, false);
        },
        /**
         * Function which sets icon to inform user about the connection state
         * @param  {String} state   the state (valid types: 'disabled', 'failed', 'connected', 'searching', 'unknown')
         * @return {Object}         returns this
         */
        setInfoState: function(state) {
            var self = this,
                connectionInfo = document.getElementById('connectionInfo');

            if(connectionInfo) connectionInfo.src = './icons/' + ((state === 'unknown')? 'battery_' : 'bluetooth_') + state + '.svg';

            return self;
        },
        /**
         * Function which disconnects from current device
         * @param  {Function} callback callback function
         */
        disconnect: function(callback) {
            bluetoothSerial.disconnect(function() {
                if(typeof callback === 'function') callback(true);
            }, function() {
                if(typeof callback === 'function') callback(false);
            });
        },
        /**
         * Function which establishes bluetooth connection for given device and retries if it failed
         * @param  {String} device  the device to connect to (MAC adress)
         * @return {void}
         */
        establishConnection: function(device) {
            var self = this,
                lng = getValue('lng', 'en');

            /**
             * Function which shows message on the snackbar
             * @param  {String} text The text to show
             * @return {Object}     returns global window
             */
            var showMessage = function(text) {
                var infoMessage = $('#infoMessage')[0].MaterialSnackbar.showSnackbar({
                    message: text,
                    duration: 2222
                });
                return window;
            };

            self.setInfoState('searching');
            self.isEnabled(function(enabled) {
                if(enabled) {
                    // check if connection already established
                    self.isConnected(function(connected) {
                        if(!connected) {
                            // connect to device
                            self.connect(device, function(err, connected) {
                                if(!err && connected) {
                                    showMessage(translate('BLUETOOTH_CONNECTED', lng)).bluetooth.setInfoState('connected');
                                    startWatch();
                                } else {
                                    showMessage(translate('BLUETOOTH_NOT_CONNECTED', lng)).bluetooth.setInfoState('failed');
                                    // retry after 3 seconds
                                    setTimeout(function () {
                                        self.establishConnection(device);
                                    }, 3000);
                                }
                            });
                        } else {
                            showMessage(translate('BLUETOOTH_CONNECTED', lng)).bluetooth.setInfoState('connected');
                            startWatch();
                        }
                    });
                } else showMessage(translate('BLUETOOTH_DISABLED', lng)).bluetooth.setInfoState('disabled');
            });
        }
    };
}
