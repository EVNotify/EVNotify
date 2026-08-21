<template></template>
<script>
    import eventBus from './../modules/event.vue';
    import helper from './../modules/helper.vue';
    import storage from './../modules/storage.vue';

    export default {
        data() {
            return {
                initCMD: [
                    'ATD', 'ATZ', 'ATE0', 'ATL0', 'ATS0', 'ATH1', 'AT0', 'ATSTFF', 'ATFE', 'ATSP6'
                ],
                offset: 0,
                initFinished: false,
                inStandbyMode: false,
                emptyResponses: 0,
                failedCommandsInCycle: 0,
                currentCommand: 0,
                pendingSetupResponses: 0,
                awaitingCommandResponse: false,
                setupDelay: 75,
                commands: [
                    {
                        name: '2105',
                        setupCommands: ['ATSH7E4', 'ATCRA7EC'],
                        delay: 2000
                    },
                    {
                        name: '2101',
                        setupCommands: ['ATSH7E4', 'ATCRA7EC'],
                        delay: 2000
                    },
                    {
                        name: '22B002',
                        setupCommands: ['ATSH7C6', 'ATCRA7CE'],
                        delay: 2000
                    }
                ]
            };
        },
        methods: {
            extractIsoTpPayload(data, canId) {
                var frameRegex = new RegExp(canId + '[0-9A-F]{16}', 'g');
                var frames = data.match(frameRegex) || [];
                var payloadBytes = [];
                var expectedLength = 0;

                frames.forEach(frame => {
                    var framePayload = frame.slice(canId.length);
                    var bytes = framePayload.match(/../g) || [];
                    var pci = bytes[0] || '';

                    if (pci.charAt(0) === '1') {
                        expectedLength = parseInt((pci.charAt(1) || '0') + (bytes[1] || '0'), 16);
                        payloadBytes = payloadBytes.concat(bytes.slice(2));
                    } else if (pci.charAt(0) === '2') {
                        payloadBytes = payloadBytes.concat(bytes.slice(1));
                    } else if (pci.charAt(0) === '0') {
                        expectedLength = parseInt(pci.charAt(1) || '0', 16);
                        payloadBytes = payloadBytes.concat(bytes.slice(1));
                    }
                });

                if (!expectedLength || payloadBytes.length < expectedLength) return '';
                return payloadBytes.slice(0, expectedLength).join('');
            },
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

                    if (!self.initFinished) {
                        if (self.offset + 1 < self.initCMD.length) {
                            bluetoothSerial.write(self.initCMD[++self.offset] + '\r');
                        } else {
                            self.initFinished = true;
                            self.sendCurrentCommand();
                        }
                        return;
                    }

                    if (self.pendingSetupResponses > 0) {
                        self.pendingSetupResponses--;
                        if (self.pendingSetupResponses === 0) self.awaitingCommandResponse = true;
                        return;
                    }

                    if (!self.awaitingCommandResponse) return;
                    self.awaitingCommandResponse = false;

                    if (self.hasAdapterError(data)) return self.reinitialize(data);
                    if (self.offset + 1 >= self.initCMD.length) {
                        // init of dongle finished, parse data and just send the OBD2 command
                        eventBus.$emit('obd2Data', self.parseData(data));
                        if (self.shouldReinitializeAfterCycleFailure(data)) return self.reinitialize(data);
                        self.sendCurrentCommand();
                    } else bluetoothSerial.write(self.initCMD[++self.offset] + '\r');
                }, err => console.error(err));

                // initialize the dongle by sending the first command
                bluetoothSerial.write(self.initCMD[self.offset] + '\r');
            },
            getCurrentCommand() {
                return this.commands[this.currentCommand];
            },
            hasAdapterError(data) {
                return data.indexOf('CANERROR') !== -1 ||
                    data.indexOf('STOPPED') !== -1 ||
                    data.indexOf('UNABLETOCONNECT') !== -1 ||
                    data.indexOf('BUFFERFULL') !== -1;
            },
            hasCommandFailure(data) {
                return data.indexOf('?') !== -1 ||
                    data.indexOf('NODATA') !== -1 ||
                    data.indexOf('7EC2600000000000000') !== -1;
            },
            reinitialize(data) {
                this.offset = -1;
                this.initFinished = false;
                this.emptyResponses = 0;
                this.failedCommandsInCycle = 0;
                this.currentCommand = 0;
                this.pendingSetupResponses = 0;
                this.awaitingCommandResponse = false;
                eventBus.$emit('obd2Error', data);
            },
            markCommandSuccess() {
                this.emptyResponses = 0;
                this.failedCommandsInCycle = 0;
            },
            markCommandFailure() {
                this.emptyResponses++;
                this.failedCommandsInCycle++;
            },
            shouldReinitializeAfterCycleFailure(data) {
                if (!this.hasCommandFailure(data)) return false;
                return this.failedCommandsInCycle >= this.commands.length;
            },
            advanceCommand() {
                this.currentCommand = (this.currentCommand + 1) % this.commands.length;
            },
            sendCurrentCommand() {
                var self = this,
                    command = self.getCurrentCommand();
                var setupCommands = command.setupCommands || [];

                self.pendingSetupResponses = setupCommands.length;
                self.awaitingCommandResponse = (setupCommands.length === 0);
                var runSetup = index => {
                    if (index >= setupCommands.length) {
                        setTimeout(() => bluetoothSerial.write(command.name + '\r'), command.delay);
                        return;
                    }
                    bluetoothSerial.write(setupCommands[index] + '\r', () => {
                        setTimeout(() => runSetup(index + 1), self.setupDelay);
                    }, err => console.error(err));
                };

                runSetup(0);
            },
            parseData(data) {
                var self = this,
                    parsedData = {},
                    baseData = self.getBaseData(),
                    command = self.getCurrentCommand(),
                    parsedSuccessfully = false;

                try {
                    if (command.name === '2105') {
                        var fourthBlock = '7EC24',
                            fifthBlock = '7EC25',
                            extractedFourthBlock = data.substring(data.indexOf(fourthBlock), data.indexOf(fifthBlock)),
                            extractedFourthData = extractedFourthBlock.replace(fourthBlock, '');

                        if (extractedFourthBlock) {
                            parsedSuccessfully = true;
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
                    } else if (command.name === '2101') {
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
                            fifthBlock = '7EC25',
                            extractedFifthBlock = ((data.indexOf(fifthBlock) !== -1) ? data.substring(data.indexOf(fifthBlock), data.indexOf(fifthBlock) +
                                19) : ''),
                            extractedFifthData = extractedFifthBlock.replace(fifthBlock, ''),
                            sixthBlock = '7EC26',
                            extractedSixthBlock = ((data.indexOf(sixthBlock) !== -1) ? data.substring(data.indexOf(sixthBlock), data.indexOf(sixthBlock) +
                                19) : ''),
                            extractedSixthData = extractedSixthBlock.replace(sixthBlock, '');

                        if (extractedFirstData && extractedSecondData && extractedThirdData && extractedFourthData && extractedFifthData && extractedSixthData && extractedSixthData !== '00000000000000') {
                            parsedSuccessfully = true;
                            // fill charging bits with leading zeros if smaller than 8 (counting binary from right to left!)
                            chargingBits = new Array(8 - chargingBits.length + 1).join(0) + chargingBits;
                            parsedData = {
                                SOC_BMS: parseInt(extractedFirstData.slice(0, 2), 16) / 2, // first byte within 1st block
                                CHARGING: parseInt(chargingBits.slice(0, 1)), // 7th bit of charging bits
                                RAPID_CHARGE_PORT: parseInt(chargingBits.slice(1, 2)), // 6th bit of charging bits
                                NORMAL_CHARGE_PORT: parseInt(chargingBits.slice(2, 3)), // 5th bit of charging bits,
                                BATTERY_CELL_VOLTAGE_MAX: parseInt(extractedFourthData.slice(0, 2), 16) / 50, // first byte within 4th block
                                BATTERY_CELL_VOLTAGE_MIN: parseInt(extractedFourthData.slice(2, 4), 16) / 50, // second byte within 4th block
                                BATTERY_FAN_SPEED: parseInt(extractedFourthData.slice(6, 8), 16), // fourth byte within 4th block
                                AUX_BATTERY_VOLTAGE: parseInt(extractedFourthData.slice(8, 10), 16) / 10, // 9th + 10th byte within fourth block divided by 10
                                BATTERY_MIN_TEMPERATURE: helper.parseSigned(extractedSecondData.slice(8, 10), 16), // fifth byte within 2nd block
                                BATTERY_MAX_TEMPERATURE: helper.parseSigned(extractedSecondData.slice(6, 8), 16), // fourth byte within 2nd block
                                BATTERY_INLET_TEMPERATURE: helper.parseSigned(extractedThirdData.slice(8, 10), 16), // fifth byte within 3rd block
                                DC_BATTERY_VOLTAGE: ((
                                        parseInt(
                                            extractedSecondData.slice(2, 4), 16 // second byte within 2nd block
                                        ) << 8) +
                                    parseInt(
                                        extractedSecondData.slice(4, 6), 16 // third byte within 2nd block
                                    )
                                ) / 10,
                                DC_BATTERY_CURRENT: helper.parseSigned(
                                  (extractedFirstData.slice(12, 14) + extractedSecondData.slice(0, 2)), 16 // concat 7th byte of first block with first byte of second block
                                ) * 0.1,
                                CUMULATIVE_ENERGY_CHARGED: ((
                                    (parseInt(
                                        extractedFifthBlock.slice(-2), 16 // last byte within 5th block
                                    ) << 24) + 
                                    (parseInt(
                                        extractedSixthData.slice(0, 2), 16 // first byte within 6th block
                                    ) << 16) + 
                                    (parseInt(
                                        extractedSixthData.slice(2, 4), 16 // second byte within 6th block
                                    ) << 8) + 
                                    (parseInt(
                                        extractedSixthData.slice(4, 6), 16 // third byte within 6th block
                                    )
                                )) / 10),
                                CUMULATIVE_ENERGY_DISCHARGED: ((
                                    (parseInt(
                                        extractedSixthData.slice(6, 8), 16 // fourth byte within 6th block
                                    ) << 24) + 
                                    (parseInt(
                                        extractedSixthData.slice(8, 10), 16 // fifth byte within 6th block
                                    ) << 16) + 
                                    (parseInt(
                                        extractedSixthData.slice(10, 12), 16 // sixth byte within 6th block
                                    ) << 8) + 
                                    (parseInt(
                                        extractedSixthData.slice(12, 14), 16 // seventh byte within 6th block
                                    )
                                )) / 10)
                            };
                            parsedData.BATTERY_CELL_VOLTAGE_DELTA = parsedData.BATTERY_CELL_VOLTAGE_MAX - parsedData.BATTERY_CELL_VOLTAGE_MIN;
                            // add battery power
                            parsedData.DC_BATTERY_POWER = parsedData.DC_BATTERY_CURRENT * parsedData.DC_BATTERY_VOLTAGE / 1000;
                        }
                    } else if (command.name === '22B002') {
                        var extractedOdoData = self.extractIsoTpPayload(data, '7CE');

                        if (extractedOdoData.length >= 24 && extractedOdoData.slice(0, 6) === '62B002') {
                            parsedSuccessfully = true;
                            parsedData = {
                                ODO: parseInt(extractedOdoData.slice(18, 24), 16)
                            };
                        }
                    }
                } catch (err) {
                    console.error(err);
                }
                if (parsedSuccessfully) self.markCommandSuccess();
                else if (self.hasCommandFailure(data)) self.markCommandFailure();
                // extend with base data
                Object.keys(baseData).forEach(key => parsedData[key] = baseData[key]);
                console.log({
                    parsedData
                });
                self.advanceCommand();
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
