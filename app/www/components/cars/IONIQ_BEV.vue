<template></template>
<script>
    import eventBus from './../modules/event.vue';

    export default {
        data() {
            return {
                initCMD: [
                    'ATD', 'ATZ', 'ATE0', 'ATL0', 'ATS0', 'ATH1', 'ATSP0', 'AT0', 'ATSTFF', 'ATFE', 'ATBRD45',
                    'ATBRD23', 'ATBRD11', 'ATBRD08'
                ],
                offset: 0,
                command: '2105'
            };
        },
        methods: {
            init() {
                var self = this;

                // unsubscribe from prior existing listener
                bluetoothSerial.unsubscribe();

                // subscribe to data
                bluetoothSerial.subscribe('>', data => {
                    // remove spaces
                    data = data.trim().replace(/\s/g, '');
                    console.log({
                        data
                    });
                    // send debug data to backend if debug mode enabled
                    if (DEBUG) Vue.http.post(RESTURL + 'debug', {
                        data
                    });

                    // error detection to start re-initialization
                    if (data.indexOf('CANERROR') !== -1 ||
                        data.indexOf('STOPPED') !== -1 ||
                        data.indexOf('UNABLETOCONNECT') !== -1) {
                        // there was an error - reset offset, to start with first command afterwards
                        self.offset = -1;
                        // emit obd2 error
                        eventBus.$emit('obd2Error', data);
                    }
                    if (self.offset + 1 === self.initCMD.length) {
                        // init of dongle finished, parse data and just send the OBD2 command
                        eventBus.$emit('obd2Data', self.parseData(data));
                        setTimeout(() => bluetoothSerial.write('2105\r'), 2000);
                    } else bluetoothSerial.write(self.initCMD[++self.offset] + '\r');
                }, err => console.error(err));

                // initialize the dongle by sending the first command
                bluetoothSerial.write(self.initCMD[self.offset] + '\r');
            },
            parseData(data) {
                var self = this,
                    parsedData = {};

                try {
                    if (self.command === '2105') {
                        var fourthBlock = '7EC24',
                            fifthBlock = '7EC25',
                            extractedFourthBlock = data.substring(data.indexOf(fourthBlock), data.indexOf(fifthBlock));

                        parsedData = {
                            SOC_DISPLAY: parseInt(
                                extractedFourthBlock.slice(-2), 16
                            ) / 2, // last byte within 4th block
                            SOH: ((
                                    parseInt(
                                        extractedFourthBlock.replace(fourthBlock, '').slice(0, 2), 16 // first byte within 4th block
                                    ) << 8) +
                                parseInt(
                                    extractedFourthBlock.replace(fourthBlock, '').slice(2, 4), 16 // second byte within 4th block
                                )
                            ) / 10
                        };
                    } else if (self.command === '2101') {
                        var firstBlock = '7EC21',
                            extractedFirstBlock = data.substring(data.indexOf(firstBlock), data.indexOf(firstBlock) +
                                19);

                        parsedData = {
                            SOC_BMS: parseInt(extractedFirstBlock.replace(firstBlock, '').slice(0, 2), 16) / 2 // first byte within 1st block
                        };
                    }
                } catch (err) {
                    console.error(err);
                }
                console.log({
                    parsedData
                });
                return parsedData;
            }
        }
    }
</script>