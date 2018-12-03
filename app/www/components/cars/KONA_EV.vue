<template></template>
<script>
    import eventBus from './../modules/event.vue';

    export default {
        data() {
            return {
                initCMD: [
                    'ATD', 'ATZ', 'ATE0', 'ATL0', 'ATS0', 'ATH1', 'AT0', 'ATSTFF', 'ATFE', 'ATSP6'
                ],
                offset: 0,
                inStandbyMode: false,
                emptyResponses: 0,
                command: '220105'
            };
        },
        methods: {
            init() {
                var self = this;

                // unsubscribe from prior existing listener
                bluetoothSerial.unsubscribe();

                // subscribe to data
                bluetoothSerial.subscribe('>', data => {
                    if (self.inStandbyMode) return;
                    // remove spaces
                    data = data.trim().replace(/\s/g, '');
                    console.log({
                        data
                    });
                    // send debug data to backend if debug mode enabled
                    if (DEBUG) Vue.http.post(RESTURL + 'debug', {
                        data
                    });

                    // error and empty response detection to start re-initialization
                    // TODO: we need to find out the error detection and empty responses for KONA EV
                    if (data.indexOf('CANERROR') !== -1 ||
                        data.indexOf('UNABLETOCONNECT') !== -1 ||
                        data.indexOf('BUFFERFULL') !== -1) {
                        // there was an error - reset offset, to start with first command afterwards
                        self.offset = -1;
                        self.emptyResponses = 0;
                        // emit obd2 error
                        eventBus.$emit('obd2Error', data);
                    }
                    if (self.offset + 1 === self.initCMD.length) {
                        // init of dongle finished, parse data and just send the OBD2 command
                        eventBus.$emit('obd2Data', self.parseData(data));
                        setTimeout(() => bluetoothSerial.write(self.command + '\r'), 2000);
                    } else bluetoothSerial.write(self.initCMD[++self.offset] + '\r');
                }, err => console.error(err));

                // initialize the dongle by sending the first command
                bluetoothSerial.write(self.initCMD[self.offset] + '\r');
            },
            parseData(data) {
                var self = this,
                    parsedData = {},
                    baseData = self.getBaseData();

                try {
                    var fifthBlock = '7EC25',
                        sixthBlock = '7EC26',
                        extractedFifthBlock = data.substring(data.indexOf(fifthBlock), data.indexOf(sixthBlock)),
                        extractedFifthData = extractedFifthBlock.replace(fifthBlock, '');
                        
                    if (extractedFifthData) {
                        parsedData = {
                            SOC_DISPLAY: parseInt(
                                extractedFifthData.substr(0, 2), 16
                            ) / 2 // first byte within 5th block
                        };
                    }
                } catch (err) {
                    console.error(err);
                }
                // extend with base data
                Object.keys(baseData).forEach(key => parsedData[key] = baseData[key]);
                console.log({
                    parsedData
                });
                return parsedData;
            },
            getBaseData() {
                return {
                    CAPACITY: 64,
                    SLOW_SPEED: 2.3,
                    NORMAL_SPEED: 4.6,
                    FAST_SPEED: 50
                };
            },
            standbyMode() {
                var self = this;

                self.inStandbyMode = true;
                // unsubscribe, and emit low power mode command
                bluetoothSerial.unsubscribe();
                bluetoothSerial.write('ATLP\r', () => {
                    eventBus.$emit('standby');
                }, err => eventBus.$emit('standby', err));
            }
        }
    }
</script>
