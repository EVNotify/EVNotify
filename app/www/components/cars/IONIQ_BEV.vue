<template></template>
<script>
    import eventBus from './../modules/event.vue';
    import storage from './../modules/storage.vue';

    export default {
        data() {
            return {
                initCMD: [
                    'ATD', 'ATZ', 'ATE0', 'ATL0', 'ATS0', 'ATH1', 'AT0', 'ATSTFF', 'ATFE', 'ATSP6', 'ATCRA7EC'
                ],
                offset: 0,
                inStandbyMode: false,
                emptyResponses: 0,
                command: '2105'
            };
        },
        methods: {
            init() {
                var self = this;

                // listener to wakeup after standby mode
                eventBus.$off('wakeup');
                eventBus.$on('wakeup', () => self.inStandbyMode = false);

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
                        data,
                        akey: storage.getValue('akey')
                    });

                    // error and empty response detection to start re-initialization
                    if (data.indexOf('CANERROR') !== -1 ||
                        data.indexOf('STOPPED') !== -1 ||
                        data.indexOf('UNABLETOCONNECT') !== -1 ||
                        data.indexOf('BUFFERFULL') !== -1 ||
                        (data.indexOf('7EC2600000000000000') !== -1 && self.emptyResponses > 5)) {
                        // there was an error - reset offset, to start with first command afterwards
                        self.offset = -1;
                        self.emptyResponses = 0;
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
                            extractedFirstBlock = ((data.indexOf(firstBlock) !== -1) ? data.substring(data.indexOf(firstBlock), data.indexOf(firstBlock) +
                                19) : ''),
                            extractedFirstData = extractedFirstBlock.replace(firstBlock, ''),
                            secondBlock = '7EC22',
                            extractedSecondBlock = ((data.indexOf(secondBlock) !== -1) ? data.substring(data.indexOf(secondBlock), data.indexOf(secondBlock) +
                                19) : ''),
                            extractedSecondData = extractedSecondBlock.replace(secondBlock, ''),
                            chargingBits = (parseInt(extractedFirstData.substr(-4).slice(0, 2), 16) >>> 0).toString(2), // before last byte within 1st block in binary
                            thirdBlock = '7EC23',
                            extractedThirdBlock = ((data.indexOf(thirdBlock) !== -1) ? data.substring(data.indexOf(thirdBlock), data.indexOf(thirdBlock) +
                                19) : ''),
                            extractedThirdData = extractedThirdBlock.replace(thirdBlock, ''),
                            fourthBlock = '7EC24',
                            extractedFourthBlock = ((data.indexOf(fourthBlock) !== -1) ? data.substring(data.indexOf(fourthBlock), data.indexOf(fourthBlock) +
                                19) : ''),
                            extractedFourthData = extractedFourthBlock.replace(fourthBlock, ''),
                            sixthBlock = '7EC26',
                            extractedSixthBlock = ((data.indexOf(sixthBlock) !== -1) ? data.substring(data.indexOf(sixthBlock), data.indexOf(sixthBlock) +
                                19) : ''),
                            extractedSixthData = extractedSixthBlock.replace(sixthBlock, '');

                        if (extractedFirstData && extractedSecondData && extractedThirdData && extractedFourthData && extractedSixthData && extractedSixthData !== '00000000000000') {
                            self.emptyResponses = 0;
                            // fill charging bits with leading zeros if smaller than 8 (counting binary from right to left!)
                            chargingBits = new Array(8 - chargingBits.length + 1).join(0) + chargingBits;
                            parsedData = {
                                SOC_BMS: parseInt(extractedFirstData.slice(0, 2), 16) / 2, // first byte within 1st block
                                CHARGING: parseInt(chargingBits.slice(0, 1)), // 7th bit of charging bits
                                RAPID_CHARGE_PORT: parseInt(chargingBits.slice(1, 2)), // 6th bit of charging bits
                                NORMAL_CHARGE_PORT: parseInt(chargingBits.slice(2, 3)), // 5th bit of charging bits,
                                AUX_BATTERY_VOLTAGE: parseInt(extractedFourthData.slice(8, 10), 16) / 10, // 9th + 10th byte within fourth block divided by 10
                                BATTERY_MIN_TEMPERATURE: parseInt(extractedSecondData.slice(8, 10), 16), // fifth byte within 2nd block
                                BATTERY_MAX_TEMPERATURE: parseInt(extractedSecondData.slice(6, 8), 16), // fourth byte within 2nd block
                                BATTERY_INLET_TEMPERATURE: parseInt(extractedThirdData.slice(4, 6), 16), // third byte within 3rd block
                                DC_BATTERY_VOLTAGE: ((
                                        parseInt(
                                            extractedSecondData.slice(2, 4), 16 // second byte within 2nd block
                                        ) << 8) +
                                    parseInt(
                                        extractedSecondData.slice(4, 6), 16 // third byte within 2nd block
                                    )
                                ) / 10,
                                DC_BATTERY_CURRENT: (((parseInt(
                                    (extractedFirstData.slice(12, 14) + extractedSecondData.slice(0, 2)), 16 // concat 7th byte of first block with first byte of second block
                                )+2**15)%(2**16))-2**15)*0.1 // some binary conversion to get signed int from value,
                            };
                            // add battery power
                            parsedData.DC_BATTERY_POWER = parsedData.DC_BATTERY_CURRENT * parsedData.DC_BATTERY_VOLTAGE / 1000;
                        } else self.emptyResponses++;
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