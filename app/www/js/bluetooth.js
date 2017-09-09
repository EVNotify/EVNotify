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
                callback(true);
            }, function() {
                callback(false);
            });
        },
        /**
         * Function which returns whether or not a device is connected
         * @param  {Function} callback callback function
         */
        isConnected: function(callback) {
            bluetoothSerial.isConnected(function() {
                callback(true);
            }, function() {
                callback(false);
            });
        },
        /**
         * Function which unsubscribes from raw data subscribtion
         * and informs whether or not the unsubscribtion was successfull
         * NOTE: the subscribtion has to be done with bluetoothSerial directly
         * because the function declarations must be there
         * @param  {Function} callback callack function
         */
        unsubscribe: function(callback) {
            bluetoothSerial.unsubscribeRawData(function() {
                callback(true);
            }, function() {
                callback(false);
            });
        },
        /**
         * Function which lists paired devices
         * @param  {Function} callback callback function
         */
        list: function(callback) {
            bluetoothSerial.list(function(devices) {
                callback(null, devices);
            }, function(err) {
                callback(err, null);
            });
        },
        /**
         * Function which connects to specified device and returns the connection state
         * @param  {String}   device   the device to connect (must be a valid id/adress fetched from list() function)
         * @param  {Function} callback callback function
         */
        connect: function(device, callback) {
            bluetoothSerial.connect(device, function() {
                callback(null, true);
            }, function(err) {
                callback(err, false);
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
                callback(null, true);
            }, function(err) {
                callback(err, false);
            });
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
                callback(true);
            }, function() {
                callback(false);
            });
        }
    };
}
