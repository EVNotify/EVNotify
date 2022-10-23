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
                    '221e0e',
                    '221e32',
                    '2202bd'
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
                        var timeout = 10;
                        if(self.currentCommand + 1 === self.commands.length)
                        {
                            timeout = 3000;
                        }
                        // init of dongle finished, parse data and just send the OBD2 command
                        eventBus.$emit('obd2Data', self.parseData(data));
                        setTimeout(() => {
                            bluetoothSerial.write(self.commands[self.currentCommand] + '\r');
                        }, timeout);
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
                    var parts = data.split(/.:/);
                    var payload = data;
                    if(parts.length > 1)
                    {
                        payload = parts.slice(1).join('');
                    }
                    
                    var response_cmd = payload.slice(0, 6).toLowerCase()
                    
                    if (response_cmd === '621e3b') {
                        parsedData = {
                            DC_BATTERY_VOLTAGE: parseInt(payload.slice(6, 10), 16) / 4
                        };
                    } else if (response_cmd === '621e3d') {
                        parsedData = {
                            DC_BATTERY_CURRENT: (parseInt(payload.slice(6, 10), 16) - 2044) / 4
                        };
                    } else if (response_cmd === '62028c') {
                        const socBMS = parseInt(payload.slice(6, 8), 16) / 2.5;
                        parsedData = {
                            SOC_BMS: socBMS, 
                            SOC_DISPLAY: ((socBMS - 8.0) / 0.88).toFixed(1)
                        };
                    } else if (response_cmd === '627448') {
                        const mode = parseInt(payload.slice(6, 8), 16);
                        parsedData = {
                            CHARGING: mode === 4 || mode === 6 ? 1 : 0,
                            NORMAL_CHARGE_PORT: mode === 4 ? 1 : 0,
                            RAPID_CHARGE_PORT: mode === 6 ? 1 : 0
                        };
                    } else if (response_cmd === '621e0f') {
                        parsedData = {
                            BATTERY_MIN_TEMPERATURE: helper.parseSigned(payload.slice(6, 10)) / 64
                        };
                    } else if (response_cmd === '621e0e') {
                        parsedData = {
                            BATTERY_MAX_TEMPERATURE: helper.parseSigned(payload.slice(6, 10)) / 64
                        };
                    }
                    else if (response_cmd === '621e32') {
                        parsedData = {
                            CUMULATIVE_ENERGY_CHARGED: (helper.parseSigned(payload.slice(22, 30)) / 8583.07212).toFixed(3),
                            CUMULATIVE_ENERGY_DISCHARGED: -(helper.parseSigned(payload.slice(30, 38)) / 8583.07212).toFixed(3)
                        };
                    }
                    else if (response_cmd === '6202bd') {
                        parsedData = {
                            ODO: parseInt(payload.slice(8, 14), 16)
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
                    CAPACITY: 31.5,
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
