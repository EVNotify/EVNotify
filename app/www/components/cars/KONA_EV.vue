<template></template>
<script>
    import eventBus from './../modules/event.vue';
    import helper from './../modules/helper.vue';
    import storage from './../modules/storage.vue';

    export default {
        data() {
            return {
                initCMD: [
                    'ATD', 'ATZ', 'ATE0', 'ATL0', 'ATS0', 'ATH1', 'ATSTFF', 'ATFE', 'ATSP6', 'ATCRA7EC'
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
                        // toggle between commands each time
                        self.command = ((self.command === '220105') ? '220101' : '220105');
			if (data.indexOf('NODATA') !== -1) bluetoothSerial.write('ATPC\r');
                        else {
				setTimeout(() => bluetoothSerial.write(self.command + '\r'), 2000);
			}
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
                    if (self.command === '220105') {
                        var fourthBlock = '7EC24',
                            fifthBlock = '7EC25',
                            extractedFourthBlock = data.substring(data.indexOf(fourthBlock), data.indexOf(fifthBlock)),
                            extractedFourthData = extractedFourthBlock.replace(fourthBlock, ''),
                            sixthBlock = '7EC26',
                            extractedFifthBlock = data.substring(data.indexOf(fifthBlock), data.indexOf(sixthBlock)),
                            extractedFifthData = extractedFifthBlock.replace(fifthBlock, '');

                        if (extractedFourthData && extractedFifthData) {
                            parsedData = {
                                SOC_DISPLAY: parseInt(
                                    extractedFifthData.substr(0, 2), 16
                                ) / 2, // first byte within 5th block
                                SOH: ((
                                        parseInt(
                                            extractedFourthData.slice(2, 4), 16 // second byte within 4th block
                                        ) << 8) +
                                    parseInt(
                                        extractedFourthData.slice(4, 6), 16 // third byte within 4th block
                                    )
                                ) / 10
                            };
                        }
                    } else if (self.command === '220101') {
                        var firstBlock = '7EC21',
                            secondBlock = '7EC22',
                            extractedFirstBlock = data.substring(data.indexOf(firstBlock), data.indexOf(secondBlock)),
                            extractedFirstData = extractedFirstBlock.replace(firstBlock, ''),
                            thirdBlock = '7EC23',
                            extractedSecondBlock = data.substring(data.indexOf(secondBlock), data.indexOf(thirdBlock)),
                            extractedSecondData = extractedSecondBlock.replace(secondBlock, ''),
                            chargingBits = (parseInt(extractedSecondData.slice(2, 4), 16) >>> 0).toString(2), // second byte within 2nd block in binary
                            fourthBlock = '7EC24',
                            extractedThirdBlock = data.substring(data.indexOf(thirdBlock), data.indexOf(fourthBlock)),
                            extractedThirdData = extractedThirdBlock.replace(thirdBlock, ''),
                            fifthBlock = '7EC25',
                            extractedFourthBlock = data.substring(data.indexOf(fourthBlock), data.indexOf(fifthBlock)),
                            extractedFourthData = extractedFourthBlock.replace(fourthBlock, ''),
                            extractedFourthData = extractedFourthBlock.replace(fourthBlock, ''),
                            sixthBlock = '7EC26',
                            extractedFifthBlock = data.substring(data.indexOf(fifthBlock), data.indexOf(sixthBlock)),
                            extractedFifthData = extractedFifthBlock.replace(fifthBlock, ''),
                            seventhBlock = '7EC27',
                            extractedSixthBlock = data.substring(data.indexOf(sixthBlock), data.indexOf(seventhBlock)),
                            extractedSixthData = extractedSixthBlock.replace(sixthBlock, ''),
                            eigthBlock = '7EC28',
                            extractedSeventhBlock = data.substring(data.indexOf(seventhBlock), data.indexOf(eigthBlock)),
                            extractedSeventhData = extractedSeventhBlock.replace(seventhBlock, ''),
                            extractedEightBlock = data.substring(data.indexOf(eigthBlock), data.indexOf(eigthBlock) + 18),
                            extractedEightData = extractedEightBlock.replace(eigthBlock, '');

                        if (extractedFirstData && extractedSecondData && extractedFourthData) {
                            // fill charging bits with leading zeros if smaller than 8 (counting binary from right to left!)
                            chargingBits = new Array(8 - chargingBits.length + 1).join(0) + chargingBits;
                            parsedData = {
                                SOC_BMS: parseInt(
                                    extractedFirstData.slice(2, 4), 16
                                ) / 2, // second byte within 1st block
                                DC_BATTERY_VOLTAGE: ((
                                        parseInt(
                                            extractedSecondData.slice(4, 6), 16 // third byte within 2nd block
                                        ) << 8) +
                                    parseInt(
                                        extractedSecondData.slice(6, 8), 16 // fourth byte within 2nd block
                                    )
                                ) / 10,
                                CHARGING: chargingBits[0],
                                NORMAL_CHARGE_PORT: chargingBits[1] && extractedFirstData.slice(12, 14) === '03', // charging and seventh byte is 03
                                RAPID_CHARGE_PORT: chargingBits[1] && extractedFirstData.slice(12, 14) !== '03',
                                BATTERY_MIN_TEMPERATURE: helper.parseSigned(extractedSecondData.slice(10, 12), 16), // sixth byte within 2nd block
                                BATTERY_MAX_TEMPERATURE: helper.parseSigned(extractedSecondData.slice(8, 10), 16), // fifth byte within 2nd block
                                BATTERY_INLET_TEMPERATURE: helper.parseSigned(extractedThirdData.slice(10, 12), 16), // sixth byte within 3rd block
                                DC_BATTERY_CURRENT: helper.parseSigned(
                                    (extractedSecondData.slice(0, 2) + extractedSecondData.slice(2, 4)), 16 // concat first and second byte of second block
                                )*0.1, // some binary conversion to get signed int from value
                                AUX_BATTERY_VOLTAGE: parseInt(extractedFourthData.slice(10, 12), 16) / 10 // sixth byte within fourth block
                            };
                            // add battery power
                            parsedData.DC_BATTERY_POWER = parsedData.DC_BATTERY_CURRENT * parsedData.DC_BATTERY_VOLTAGE / 1000;
                            // experimental charging detection
                            parsedData.CHARGING =  ((
                                    //["FD","FB","FE","FF","00","FC"].indexOf(extractedSecondData.slice(0, 2)) > -1 &&
                                    ["09"].indexOf(extractedSeventhData.slice(10, 12)) > -1 ) ? 1 : 0
                            );
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
