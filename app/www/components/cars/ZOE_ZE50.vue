<template></template>
<script>
    import eventBus from '../modules/event.vue';
    import helper from '../modules/helper.vue';
    import storage from '../modules/storage.vue';

    export default {
        data() {
            return {
                initCMD: [
                    'ATD', 'ATZ', 'ATE0', 'ATL0', 'ATSP7'
                ],
                offset: 0,
                inStandbyMode: false,
                emptyResponses: 0,
                currentCommand: 0,
                commands: [
                    '229002'
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
                    data = data.replace(self.commands[self.currentCommand], '').replace('>', '');

                    if (self.currentCommand === 0) {
                        parsedData = {
                            SOC_DISPLAY: parseInt(data.substr(-4), 16) / 100
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
                    CAPACITY: 58,
                    SLOW_SPEED: 2.3,
                    NORMAL_SPEED: 11,
                    FAST_SPEED: 100
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
