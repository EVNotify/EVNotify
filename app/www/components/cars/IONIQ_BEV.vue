<template></template>
<script>
    import eventBus from './../modules/event.vue';

    export default {
        data() {
            return {
                initCMD: [
                    'ATD', 'ATZ', 'ATE0', 'ATL0', 'ATS0', 'ATH0', 'ATSP0', 'AT0', 'ATSTFF', 'ATFE', 'ATBRD45',
                    'ATBRD23', 'ATBRD11', 'ATBRD08'
                ],
                offset: 0
            };
        },
        methods: {
            init() {
                var self = this;

                // unsubscribe from prior existing listener
                bluetoothSerial.unsubscribe();

                // subscribe to data
                bluetoothSerial.subscribe('>', data => {
                    console.log({
                        data
                    });
                    // TODO error detection (CAN ERROR..)
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

                // remove unwanted characters and pair them in bytes again
                data = data.trim().replace(/\s/g, '');
                try {
                    parsedData = {
                        SOC_DISPLAY: parseInt(
                            data.substring(data.indexOf('4:'), data.indexOf('5:')).slice(-2), 16
                        ) / 2 // last byte before 5:
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
