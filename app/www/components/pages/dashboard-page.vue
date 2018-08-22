<!-- The Dashboard Page -->
<template>
    <div>
        <toolbar @debugChanged="debugInfo()"></toolbar>
        <div class="content-within-page">
            <div class="md-layout md-gutter md-alignment-center dashboard-card-list">
                <md-card class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100">
                    <md-card-header>
                        <md-card-media>
                            <img :src="batteryIcon">
                            <div class="dashboard-soh">
                                <img src="icons/favorite.svg">{{ obd2Data.SOH || 0}}%
                            </div>
                        </md-card-media>
                        <md-card-header-text>
                            <div class="md-title">{{ obd2Data.SOC_DISPLAY || 0 }}% [{{ obd2Data.SOC_BMS || 0 }}%]</div>
                            <div class="md-subhead">{{ translated.SOC_DISPLAY }} [{{ translated.SOC_BMS }}]</div>
                            <md-divider></md-divider>
                            <div>
                                <img src="icons/sync_enabled.svg">{{ formatDate(timestamp) }}
                            </div>
                        </md-card-header-text>
                    </md-card-header>
                </md-card>
                <md-card class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100">
                    <md-card-header>
                        <md-card-media>
                            <img src="icons/car.svg">
                        </md-card-media>
                        <md-card-header-text>
                            <div class="md-title">{{ estimatedRangeCurrent }}km / {{ estimatedRangeTotal }}km</div>
                            <div class="md-subhead">{{ translated.ESTIMATED_RANGE }}</div>
                            <md-divider></md-divider>
                            <div>
                                <img src="icons/ev_station.svg">{{ consumption || 0 }}kWh/100km
                            </div>
                        </md-card-header-text>
                    </md-card-header>
                </md-card>
                <md-card class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100">
                    <md-card-header>
                        <md-card-media>
                            <img src="icons/schedule.svg">
                        </md-card-media>
                        <md-card-header-text>
                            <div class="md-title">
                                <ul class="dashboard-charging-times">
                                    <li>{{ formatDecimalTime(estimatedSlowTime) }}</li>
                                    <li>{{ formatDecimalTime(estimatedNormalTime) }}</li>
                                    <li>{{ formatDecimalTime(estimatedFastTime) }}</li>
                                </ul>
                            </div>
                            <div class="md-subhead">{{ translated.ESTIMATED_TIME }}</div>
                            <md-divider></md-divider>
                            {{ translated.CHARGING_SPEEDS }}
                        </md-card-header-text>
                    </md-card-header>
                </md-card>
            </div>
        </div>
        <IONIQBEV ref="IONIQ_BEV"></IONIQBEV>
        <md-snackbar md-position="center" :md-persistent="true" :md-active.sync="showSidebar" :md-duration="((persistentSnackbar) ? Infinity : 3000)">
            <span>{{ sidebarText }}</span>
        </md-snackbar>
        <bottom-bar></bottom-bar>
    </div>
</template>

<script>
    import helper from './../modules/helper.vue';
    import toolbar from './../container/toolbar.vue';
    import translation from './../modules/translation.vue';
    import storage from './../modules/storage.vue';
    import eventBus from './../modules/event.vue';
    import bottomBar from './../container/bottom-bar.vue';
    import IONIQBEV from './../cars/IONIQ_BEV.vue';
    import SOULEV from './../cars/SOUL_EV.vue';

    export default {
        data() {
            return {
                obd2Data: {},
                showSidebar: false,
                sidebarText: '',
                bluetoothInterval: 0,
                syncInterval: 0,
                timestamp: '?',
                device: null,
                car: null,
                consumption: 0,
                supportedCars: ['IONIQ_BEV', 'SOUL_EV'],
                initialized: false,
                translated: {},
                isWaitingForEnable: false,
                estimatedRangeCurrent: 0,
                estimatedRangeTotal: 0,
                estimatedSlowTime: 0,
                estimatedNormalTime: 0,
                estimatedFastTime: 0,
                batteryIcon: 'icons/battery_unknown.svg',
                persistentSnackbar: false
            };
        },
        watch: {
            'obd2Data.SOC_DISPLAY': 'estimate'
        },
        methods: {
            formatDate(timestamp) {
                return helper.formatDate(timestamp);
            },
            formatDecimalTime(time) {
                return helper.convertDecimalTime(time) + 'h';
            },
            startWatch() {
                var self = this;

                // if device set and car supported, start watch
                if (self.device && self.supportedCars.indexOf(self.car) !== -1) {
                    self.bluetoothInterval = setInterval(() => {
                        var proceed = () => {
                            bluetoothSerial.isConnected(connected => {
                                // run init process if not already running
                                if (!self.initialized) {
                                    self.initialized = true;
                                    self.$refs[self.car].init();
                                }
                                eventBus.$emit('bluetoothChanged', 'connected');
                            }, disconnected => {
                                bluetoothSerial.connect(self.device, connected => {
                                    // run init process if not already running
                                    if (!self.initialized) {
                                        self.initialized = true;
                                        self.$refs[self.car].init();
                                    }
                                    eventBus.$emit('bluetoothChanged', 'connected');
                                }, err => {
                                    self.showSidebar = true;
                                    self.persistentSnackbar = true;
                                    eventBus.$emit('bluetoothChanged', 'disabled');
                                    self.sidebarText = translation.translate(
                                        'BLUETOOTH_CONNECT_ERROR');
                                });
                            });
                        };

                        bluetoothSerial.isEnabled(enabled => {
                            proceed();
                        }, disabled => {
                            if (self.isWaitingForEnable) return; // there is already a dialog to wait for acceptance
                            self.isWaitingForEnable = true;
                            eventBus.$emit('bluetoothChanged', 'searching');
                            bluetoothSerial.enable(enabled => {
                                self.isWaitingForEnable = false;
                                proceed();
                            }, err => {
                                self.showSidebar = true;
                                self.persistentSnackbar = false;
                                eventBus.$emit('bluetoothChanged', 'disabled');
                                self.sidebarText = translation.translate(
                                    'BLUETOOTH_ENABLE_ERROR');
                            });
                        });
                    }, 1000);
                    self.syncInterval = setInterval(() => {
                        // check if connected or not to determine if we need to push or pull soc
                        bluetoothSerial.isConnected(connected => {
                            if (self.obd2Data.SOC_DISPLAY || self.obd2Data.SOC_BMS) {
                                  // push soc
                                self.$http.post(RESTURL + 'soc', {
                                    akey: storage.getValue('akey'),
                                    token: storage.getValue('token'),
                                    display: self.obd2Data.SOC_DISPLAY,
                                    bms: self.obd2Data.SOC_BMS
                                }).then(response => {
                                    eventBus.$emit('syncChanged', 'enabled');
                                }, err => eventBus.$emit('syncChanged', 'problem'));
                            }
                        }, disconnected => {
                            // get soc
                            self.$http.get(RESTURL + 'soc', {
                                params: {
                                    akey: storage.getValue('akey'),
                                    token: storage.getValue('token')
                                }
                            }).then(response => {
                                var baseData = self.$refs[self.car].getBaseData();

                                // extend with base data
                                Object.keys(baseData).forEach(key => Vue.set(self.obd2Data, key, baseData[key]));
                                // update soc info
                                Vue.set(self.obd2Data, 'SOC_DISPLAY', response.body.soc_display);
                                Vue.set(self.obd2Data, 'SOC_BMS', response.body.soc_bms);
                                self.timestamp = response.body.last_soc;
                                eventBus.$emit('syncChanged', 'enabled');
                            }, err => eventBus.$emit('syncChanged', 'problem'));
                        });
                    }, 10000);
                } else {
                    self.showSidebar = true;
                    self.persistentSnackbar = true;
                    self.sidebarText = translation.translate(((!self.device) ? 'NO_DEVICE_SELECTED' : 'NO_CAR_SELECTED'));
                }
            },
            debugInfo() {
                this.showSidebar = true;
                this.persistentSnackbar = false;
                this.sidebarText = translation.translate('DEBUG_MODE_' + ((DEBUG) ? 'ENABLED' : 'DISABLED'));
            },
            estimate() {
                var soc = this.obd2Data.SOC_DISPLAY; // TODO: Change dynamically later to bms if required

                if (typeof soc !== 'number' || isNaN(soc) ||
                    typeof this.consumption !== 'number' || isNaN(this.consumption) ||
                    typeof this.obd2Data.CAPACITY !== 'number' || isNaN(this.obd2Data.CAPACITY)) {
                    this.estimatedRangeCurrent = this.estimatedRangeTotal = this.estimatedSlowTime = this.estimatedNormalTime = this.estimatedFastTime = 0;
                    this.batteryIcon = 'icons/battery_unknown.svg';
                } else {
                    // calculate range
                    this.estimatedRangeTotal = parseInt((this.obd2Data.CAPACITY / this.consumption) * 100) || 0;
                    this.estimatedRangeCurrent = parseInt(this.estimatedRangeTotal * ((soc === 100) ? 1 :
                        '0.' + ((soc < 10)? ('0' + soc) : soc))) || 0;
                    // calculate time
                    if (this.obd2Data.SLOW_SPEED && this.obd2Data.NORMAL_SPEED && this.obd2Data.FAST_SPEED) {
                        var amountToCharge = this.obd2Data.CAPACITY - parseFloat(this.obd2Data.CAPACITY * ((soc === 100)? 1 :
                            '0.' + ((soc < 10)? ('0' + soc) : soc))).toFixed(2) || 0;
                        
                        this.estimatedSlowTime = parseFloat((amountToCharge / this.obd2Data.SLOW_SPEED).toFixed(2));
                        this.estimatedNormalTime = parseFloat((amountToCharge / this.obd2Data.NORMAL_SPEED).toFixed(2));
                        this.estimatedFastTime = parseFloat((amountToCharge / this.obd2Data.FAST_SPEED).toFixed(2));
                    }
                    // set icon based on soc
                    this.batteryIcon = 'icons/battery_' + (Math.ceil(( ((soc === 100)? 99 : parseInt(soc)) + 1) / 5) * 5) + '.svg';
                }
            }
        },
        components: {
            bottomBar,
            toolbar,
            IONIQBEV,
            SOULEV
        },
        beforeDestroy() {
            clearInterval(this.bluetoothInterval);
            clearInterval(this.syncInterval);
            if (typeof bluetoothSerial !== 'undefined') bluetoothSerial.unsubscribe();
        },
        created() {
            var self = this;

            self.translated = translation.translatePage();
            self.device = storage.getValue('settings', {}).device;
            self.car = storage.getValue('settings', {}).car;
            self.consumption = parseFloat(storage.getValue('settings', {}).consumption) || 0;

            // wait for cordova device to be ready - apply listener, if not ready yet
            if (self.$root.deviceReady) self.startWatch();
            else {
                eventBus.$on('deviceReady', function () {
                    self.startWatch();
                });
            }
            eventBus.$on('obd2Data', function (data) {
                // update / extend local obd2 data - use Vue.set due to reactivity
                Object.keys(data).forEach(key => Vue.set(self.obd2Data, key, data[key]));
                // set current timestamp
                self.timestamp = parseInt(new Date().getTime()  / 1000);
            });
            eventBus.$on('obd2Error', function (error) {
                self.showSidebar = true;
                self.persistentSnackbar = false;
                self.sidebarText = translation.translate('OBD2_ERROR');
            });
        }
    }
</script>