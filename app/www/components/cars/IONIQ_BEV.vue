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
                        // toggle between commands each time
                        self.command = ((self.command === '2105') ? '2101' : '2105');
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
                    if (self.command === '2105') {
                        var fourthBlock = '7EC24',
                            fifthBlock = '7EC25',
                            extractedFourthBlock = data.substring(data.indexOf(fourthBlock), data.indexOf(fifthBlock)),
                            extractedFourthData = extractedFourthBlock.replace(fourthBlock, '');

                        if (extractedFourthBlock) {
                            parsedData = {
                                SOC_DISPLAY: parseInt(
                                    extractedFourthBlock.slice(-2), 16
                                ) / 2, // last byte within 4th block
                                SOH: ((
                                        parseInt(
                                            extractedFourthData.slice(0, 2), 16 // first byte within 4th block
                                        ) << 8) +
                                    parseInt(
                                        extractedFourthData.slice(2, 4), 16 // second byte within 4th block
                                    )
                                ) / 10
                            };
                        }
                    } else if (self.command === '2101') {
                        var firstBlock = '7EC21',
                            extractedFirstBlock = data.substring(data.indexOf(firstBlock), data.indexOf(firstBlock) +
                                19),
                            extractedFirstData = extractedFirstBlock.replace(firstBlock, ''),
                            chargingBits = (parseInt(extractedFirstData.substr(-4).slice(0, 2), 16) >>> 0).toString(2); // before last byte within 1st block in binary

                        if (extractedFirstBlock) {
                            // fill charging bits with leading zeros if smaller than 8 (counting binary from right to left!)
                            chargingBits = new Array(8 - chargingBits.length + 1).join(0) + chargingBits;
                            parsedData = {
                                SOC_BMS: parseInt(extractedFirstData.slice(0, 2), 16) / 2, // first byte within 1st block
                                CHARGING: parseInt(chargingBits.slice(0, 1)), // 7th bit of charging bits
                                RAPID_CHARGE_PORT: parseInt(chargingBits.slice(1, 2)), // 6th bit of charging bits
                                NORMAL_CHARGE_PORT: parseInt(chargingBits.slice(2, 3)) // 5th bit of charging bits
                            };
                        }
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
                    CAPACITY: 28,
                    SLOW_SPEED: 2.3,
                    NORMAL_SPEED: 4.6,
                    FAST_SPEED: 50
                };
            }
        }
    }
</script>