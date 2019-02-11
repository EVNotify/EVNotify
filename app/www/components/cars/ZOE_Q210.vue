<template></template>
<script>
    import eventBus from './../modules/event.vue';
    import storage from './../modules/storage.vue';

    export default {
        data() {
            return {
                initCMD: [
                    'ATD', 'ATZ', 'ATE0', 'ATL0', 'ATS0', 'ATH1', 'AT0', 'ATSTFF', 'ATFE', 'ATSP6', 'ATAL', 'ATCM7FF', 'ATCF654'
                ],
                inStandbyMode: false,
                offset: 0,
                response: '',
                monitoring: false
            };
        },
        methods: {
            init() {
                var self = this;

                // listener to wakeup after standby mode
                eventBus.$off('wakeup');
                eventBus.$on('wakeup', () => self.inStandbyMode = false);
                
                // unsubscribe from previous listener
                bluetoothSerial.unsubscribe();
                bluetoothSerial.unsubscribeRawData();
                // reset response
                self.response = '';
                // subscribe to data (will be used for monitoring init only)
                bluetoothSerial.subscribe('>', data => {
                    if (self.inStandbyMode) return;
                    // remove spaces
                    data = data.trim().replace(/\s/g, '');
                    console.log({
                        data
                    });
                    // send debug data to backend if debug mode enabled
                    if (DEBUG) Vue.http.post(RESTURL + 'debug', {
                        data,
                        akey: storage.getValue('akey')
                    });
                    // error detection to start re-initialization
                    if (data.indexOf('CANERROR') !== -1 ||
                        data.indexOf('STOPPED') !== -1 ||
                        data.indexOf('UNABLETOCONNECT') !== -1 ||
                        data.indexOf('BUFFERFULL') !== -1) {
                        // there was an error - reset offset, to start with first command afterwards
                        self.offset = -1;
                        // reset response
                        self.response = '';
                        // emit obd2 error
                        eventBus.$emit('obd2Error', data);
                    }
                    if (self.offset + 1 === self.initCMD.length) {
                        // init of dongle finished. start monitoring
                        if (self.monitoring) return;
                        setTimeout(() => bluetoothSerial.write('ATMA\r'), 2000);
                        self.monitoring = true;
                    } else bluetoothSerial.write(self.initCMD[++self.offset] + '\r');
                }, err => console.error(err));

                // subscribe to listen to raw bytes that are running over the bus
                bluetoothSerial.subscribeRawData(raw => {
                    var bytes = new Uint8Array(raw),
                        data = new TextDecoder('utf-8').decode(bytes)

                    if (DEBUG) Vue.http.post(RESTURL + 'debug', {
                        data,
                        akey: storage.getValue('akey')
                    });
                    // concat the data and add them until we reached all bytes
                    self.response += data;
                    // parse the full response
                    if (self.response.length >= 19) eventBus.$emit('obd2Data', self.parseData(self.response));
                });

                // initialize the dongle by sending the first command
                bluetoothSerial.write(self.initCMD[self.offset] + '\r');
            },
            parseData(data) {
                 var self = this,
                    parsedData = {},
                    baseData = self.getBaseData();

                try {
                    if (data.indexOf('654') !== -1) {
                        parsedData = {
                            SOC_DISPLAY: parseInt(data.substring(data.indexOf('654') + 3).slice(6, 8), 16), // 4th byte in data block
                            CHARGING: 1,
                            SLOW_CHARGE_PORT: 1,
                            NORMAL_CHARGE_PORT: 1,
                            RAPID_CHARGE_PORT: 1
                        };
                    }
                } catch (err) {
                    console.error(err);
                }
                // reset response again
                self.response = '';
                // extend with base data
                Object.keys(baseData).forEach(key => parsedData[key] = baseData[key]);
                console.log({
                    parsedData
                });
                return parsedData;
            },
            getBaseData() {
                return {
                    CAPACITY: 22,
                    SLOW_SPEED: 2.3,
                    NORMAL_SPEED: 22,
                    FAST_SPEED: 43
                };
            },
            standbyMode() {
                var self = this;

                self.inStandbyMode = true;
                // unsubscribe, and emit low power mode command
                bluetoothSerial.unsubscribe();
                // wait for callback to prevent conflict with passive data on bus
                bluetoothSerial.unsubscribeRawData(() => {
                    bluetoothSerial.write('ATLP\r', () => {
                        eventBus.$emit('standby');
                    }, err => eventBus.$emit('standby', err));
                }, () => {
                    bluetoothSerial.write('ATLP\r', () => {
                        eventBus.$emit('standby');
                    }, err => eventBus.$emit('standby', err));
                });
            }
        }
    }
</script>