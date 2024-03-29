<template></template>
<script>
    import eventBus from '../modules/event.vue';
    import helper from '../modules/helper.vue';
    import storage from '../modules/storage.vue';

    export default {
        data() {
            return {
                initCMD: [
                    'ATD', 'ATZ', 'ATE0', 'ATL0', 'ATAT1', 'ATST64', 'ATSP6', 'ATSH 7E5', 'ATCRA 7ED'
                ],
                offset: 0,
                inStandbyMode: false,
                emptyResponses: 0,
                currentCommand: 0,
                commands: [
                    '221e3b',
                    '221e3d',
                    '22028C',
                    '227448',
                    '221e0f',
                    '221e0e'
                ]
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
                        data: self.commands[self.currentCommand] + ': ' + data,
                        akey: storage.getValue('akey')
                    });

                    if (self.offset + 1 === self.initCMD.length) {
                        // init of dongle finished, parse data and just send the OBD2 command
                        eventBus.$emit('obd2Data', self.parseData(data));
                        setTimeout(() => {
                            bluetoothSerial.write(self.commands[self.currentCommand] + '\r');
                        }, 500);
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
                    if (self.currentCommand === 0) {
                        const firstDataByte = parseInt(data.slice(6, 8), 16);
                        const secondDataByte = parseInt(data.slice(8, 10), 16);

                        parsedData = {
                            DC_BATTERY_VOLTAGE: ((firstDataByte << 8) + secondDataByte) / 4
                        };
                    } else if (self.currentCommand === 1) {
                        const firstDataByte = parseInt(data.slice(6, 8), 16);
                        const secondDataByte = parseInt(data.slice(8, 10), 16);

                        parsedData = {
                            DC_BATTERY_CURRENT: ((firstDataByte << 8) + secondDataByte - 2044) / 4
                        };
                    } else if (self.currentCommand === 2) {
                        const socBMS = parseInt(data.slice(6, 8), 16) / 2.5;

                        parsedData = {
                            SOC_BMS: socBMS,
                            SOC_DISPLAY: (socBMS * 51 / 46 - 6.4).toFixed(1)
                        };
                    } else if (self.currentCommand === 3) {
                        const mode = parseInt(data.slice(6, 8), 16);

                        parsedData = {
                            CHARGING: mode === 4 || mode === 6 ? 1 : 0,
                            NORMAL_CHARGE_PORT: mode === 4 ? 1 : 0,
                            RAPID_CHARGE_PORT: mode === 6 ? 1 : 0
                        };
                    } else if (self.currentCommand === 4) {
                        const firstDataByte = helper.parseSigned(data.slice(6, 8));
                        const secondDataByte = Math.abs(helper.parseSigned(data.slice(8, 10)));

                        parsedData = {
                            BATTERY_MIN_TEMPERATURE: ((firstDataByte << 8) + secondDataByte) / 64
                        };
                    } else if (self.currentCommand === 5) {
                        const firstDataByte = helper.parseSigned(data.slice(6, 8));
                        const secondDataByte = Math.abs(helper.parseSigned(data.slice(8, 10)));

                        parsedData = {
                            BATTERY_MAX_TEMPERATURE: ((firstDataByte << 8) + secondDataByte) / 64
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
                
                if (self.currentCommand + 1 === self.commands.length) self.currentCommand = 0;
                else self.currentCommand++;

                return parsedData;
            },
            getBaseData() {
                return {
                    CAPACITY: 32.3,
                    SLOW_SPEED: 2.3,
                    NORMAL_SPEED: 7.2,
                    FAST_SPEED: 40
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
