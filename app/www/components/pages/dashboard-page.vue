<!-- The Dashboard Page -->
<template>
    <div>
        <toolbar @debugChanged="debugInfo()"></toolbar>
        <div class="content-within-page">
            <vueper-slides :fixed-height="true">
                <vueper-slide v-for="i in 4" :key="i">
                    <div slot="slideContent">
                        <div v-if="i === 1" class="md-layout md-gutter md-alignment-center dashboard-card-list">
                            <md-card class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100">
                                <md-card-header>
                                    <md-card-media>
                                        <img :src="batteryIcon">
                                    </md-card-media>
                                    <md-card-header-text>
                                        <div class="md-title">{{ obd2Data.SOC_DISPLAY || 0 }}%</div>
                                        <div class="md-subhead">{{ translated.SOC_DISPLAY }}</div>
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
                                        <div class="md-title">{{ estimatedRangeCurrent }}km / {{ estimatedRangeTotal
                                            }}km</div>
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
                                                <li v-if="!obd2Data.CHARGING || obd2Data.CHARGING && obd2Data.SLOW_CHARGE_PORT">
                                                    {{ formatDecimalTime(estimatedSlowTime) }}
                                                </li>
                                                <li v-if="!obd2Data.CHARGING || obd2Data.CHARGING && obd2Data.NORMAL_CHARGE_PORT">
                                                    {{ formatDecimalTime(estimatedNormalTime) }}
                                                </li>
                                                <li v-if="!obd2Data.CHARGING || obd2Data.CHARGING && obd2Data.RAPID_CHARGE_PORT">
                                                    {{ formatDecimalTime(estimatedFastTime) }}
                                                </li>
                                            </ul>
                                        </div>
                                        <div class="md-subhead">{{ translated.ESTIMATED_TIME }}</div>
                                        <md-divider></md-divider>
                                        <div v-if="!obd2Data.CHARGING">{{ translated.CHARGING_SPEEDS }}</div>
                                        <div v-if="obd2Data.CHARGING">{{ translated.IS_CHARGING }}</div>
                                    </md-card-header-text>
                                </md-card-header>
                            </md-card>
                        </div>
                        <div v-if="i === 2" class="md-layout md-gutter md-alignment-center dashboard-card-list">
                            <md-card class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100">
                                <md-card-header>
                                    <md-card-media>
                                        <img :src="batteryIcon">
                                    </md-card-media>
                                    <md-card-header-text>
                                        <div class="md-title">{{ obd2Data.SOC_BMS || 0 }}%</div>
                                        <div class="md-subhead">{{ translated.SOC_BMS }}</div>
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
                                        <img src="icons/favorite.svg">
                                    </md-card-media>
                                    <md-card-header-text>
                                        <div class="md-title">{{ obd2Data.SOH || 0 }}%</div>
                                        <div class="md-subhead">{{ translated.SOH }}</div>
                                    </md-card-header-text>
                                </md-card-header>
                            </md-card>
                            <md-card class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100">
                                <md-card-header>
                                    <md-card-media>
                                        <img src="icons/flash.svg">
                                    </md-card-media>
                                    <md-card-header-text>
                                        <div class="md-title">{{ obd2Data.AUX_BATTERY_VOLTAGE || 0 }}V</div>
                                        <div class="md-subhead">{{ translated.AUX_BATTERY_VOLTAGE }}</div>
                                    </md-card-header-text>
                                </md-card-header>
                            </md-card>
                        </div>
                        <div v-if="i === 3" class="md-layout md-gutter md-alignment-center dashboard-card-list">
                            <md-card class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100">
                                <md-card-header>
                                    <md-card-media>
                                        <img src="icons/battery_charging_100.svg">
                                    </md-card-media>
                                    <md-card-header-text>
                                        <div class="md-title">{{ roundTo2Digits(obd2Data.DC_BATTERY_VOLTAGE) || 0 }}V</div>
                                        <div class="md-subhead">{{ translated.DC_BATTERY_VOLTAGE }}</div>
                                    </md-card-header-text>
                                </md-card-header>
                            </md-card>
                            <md-card class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100">
                                <md-card-header>
                                    <md-card-media>
                                        <img src="icons/flash_auto.svg">
                                    </md-card-media>
                                    <md-card-header-text>
                                        <div class="md-title">{{ roundTo2Digits(obd2Data.DC_BATTERY_CURRENT) || 0 }}A</div>
                                        <div class="md-subhead">{{ translated.DC_BATTERY_CURRENT }}</div>
                                    </md-card-header-text>
                                </md-card-header>
                            </md-card>
                            <md-card class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100">
                                <md-card-header>
                                    <md-card-media>
                                        <img src="icons/power.svg">
                                    </md-card-media>
                                    <md-card-header-text>
                                        <div class="md-title">{{ roundTo2Digits(obd2Data.DC_BATTERY_POWER) || 0 }}kW</div>
                                        <div class="md-subhead">{{ translated.DC_BATTERY_POWER }}</div>
                                    </md-card-header-text>
                                </md-card-header>
                            </md-card>
                        </div>
                        <div v-if="i === 4" class="md-layout md-gutter md-alignment-center dashboard-card-list">
                            <md-card class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100">
                                <md-card-header>
                                    <md-card-media>
                                        <img src="icons/cold.svg">
                                    </md-card-media>
                                    <md-card-header-text>
                                        <div class="md-title">{{ obd2Data.BATTERY_MIN_TEMPERATURE || 0 }}°C</div>
                                        <div class="md-subhead">{{ translated.BATTERY_MIN_TEMPERATURE }}</div>
                                    </md-card-header-text>
                                </md-card-header>
                            </md-card>
                            <md-card class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100">
                                <md-card-header>
                                    <md-card-media>
                                        <img src="icons/hot.svg">
                                    </md-card-media>
                                    <md-card-header-text>
                                        <div class="md-title">{{ obd2Data.BATTERY_MAX_TEMPERATURE || 0 }}°C</div>
                                        <div class="md-subhead">{{ translated.BATTERY_MAX_TEMPERATURE }}</div>
                                    </md-card-header-text>
                                </md-card-header>
                            </md-card>
                            <md-card class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100">
                                <md-card-header>
                                    <md-card-media>
                                        <img src="icons/temperature.svg">
                                    </md-card-media>
                                    <md-card-header-text>
                                        <div class="md-title">{{ obd2Data.BATTERY_INLET_TEMPERATURE || 0 }}°C</div>
                                        <div class="md-subhead">{{ translated.BATTERY_INLET_TEMPERATURE }}</div>
                                    </md-card-header-text>
                                </md-card-header>
                            </md-card>
                        </div>
                    </div>
                </vueper-slide>
            </vueper-slides>
        </div>
        <AMPERAE ref="AMPERA_E"></AMPERAE>
        <IONIQBEV ref="IONIQ_BEV"></IONIQBEV>
        <IONIQHEV ref="IONIQ_HEV"></IONIQHEV>
        <IONIQPHEV ref="IONIQ_PHEV"></IONIQPHEV>
        <SOULEV ref="SOUL_EV"></SOULEV>
        <KONAEV ref="KONA_EV"></KONAEV>
        <snackbar ref="snackbar"></snackbar>
        <bottom-bar></bottom-bar>
    </div>
</template>

<script>
    import helper from './../modules/helper.vue';
    import http from './../modules/http.vue';
    import toolbar from './../container/toolbar.vue';
    import translation from './../modules/translation.vue';
    import storage from './../modules/storage.vue';
    import eventBus from './../modules/event.vue';
    import snackbar from './../modules/snackbar.vue';
    import bottomBar from './../container/bottom-bar.vue';
    import AMPERAE from './../cars/AMPERA_E.vue';
    import IONIQBEV from './../cars/IONIQ_BEV.vue';
    import IONIQHEV from './../cars/IONIQ_HEV.vue';
    import IONIQPHEV from './../cars/IONIQ_PHEV.vue';
    import SOULEV from './../cars/SOUL_EV.vue';
    import KONAEV from './../cars/KONA_EV.vue';

    export default {
        data() {
            return {
                obd2Data: {},
                bluetoothInterval: 0,
                syncInterval: 0,
                locationWatcher: 0,
                chargingWatcher: 0,
                standbyWatcher: 0,
                timestamp: '?',
                device: null,
                car: null,
                push: false,
                socThreshold: 0,
                notificationSent: false,
                errorNotificationSent: false,
                usedNotificationType: '',
                showedBluetoothError: false,
                chargingStarted: false,
                chargingStartSOC: 0,
                lastResponse: 0,
                consumption: 0,
                supportedCars: ['IONIQ_BEV', 'IONIQ_HEV', 'IONIQ_PHEV', 'SOUL_EV', 'AMPERA_E', 'KONA_EV'],
                initialized: false,
                translated: {},
                isWaitingForEnable: false,
                isWaitingForConnect: false,
                estimatedRangeCurrent: 0,
                estimatedRangeTotal: 0,
                estimatedSlowTime: 0,
                estimatedNormalTime: 0,
                estimatedFastTime: 0,
                communicationEstablished: false,
                batteryIcon: 'icons/battery_unknown.svg',
                debugSettings: {},
                syncMode: ''
            };
        },
        watch: {
            'obd2Data.SOC_DISPLAY': 'estimate',
            'obd2Data.CHARGING': 'estimate',
            'obd2Data.DC_BATTERY_POWER': 'estimate',
            'initialized': 'initMessage',
            'communicationEstablished': 'communicationMessage'
        },
        methods: {
            formatDate(timestamp) {
                return helper.formatDate(timestamp);
            },
            formatDecimalTime(time) {
                return helper.convertDecimalTime(time) + 'h';
            },
            roundTo2Digits(num) {
                if (!isNaN(parseFloat(num)) && isFinite(num)) return parseFloat(num).toFixed(2);
                return 0;
            },
            syncEventEmitter(err, mode) {
                eventBus.$emit('syncChanged', ((!err) ? 'enabled' : 'problem'));
                eventBus.$emit('syncModeChanged', ((!err && mode) ? mode : 'off'));
            },
            pushData(callback) {
                var self = this;

                http.sendRequest('POST', 'soc', {
                    akey: storage.getValue('akey'),
                    token: storage.getValue('token'),
                    display: self.obd2Data.SOC_DISPLAY,
                    bms: self.obd2Data.SOC_BMS
                }, false, err => {
                    // TODO: if err.status===0, the request failed because of a timeout, which most likely means that there is no internet connection. We could collect all of these failed requests and push them later to keep history.
                    self.syncEventEmitter(err, 'upload');
                    if (!err) {
                        // push extended data
                        http.sendRequest('POST', 'extended', {
                            akey: storage.getValue('akey'),
                            token: storage.getValue('token'),
                            soh: self.obd2Data.SOH,
                            charging: self.obd2Data.CHARGING,
                            rapidChargePort: self.obd2Data.RAPID_CHARGE_PORT,
                            normalChargePort: self.obd2Data.NORMAL_CHARGE_PORT,
                            slowChargePort: self.obd2Data.SLOW_CHARGE_PORT,
                            auxBatteryVoltage: self.obd2Data.AUX_BATTERY_VOLTAGE,
                            dcBatteryCurrent: self.obd2Data.DC_BATTERY_CURRENT,
                            dcBatteryVoltage: self.obd2Data.DC_BATTERY_VOLTAGE,
                            dcBatteryPower: self.obd2Data.DC_BATTERY_POWER,
                            batteryMinTemperature: self.obd2Data.BATTERY_MIN_TEMPERATURE,
                            batteryMaxTemperature: self.obd2Data.BATTERY_MAX_TEMPERATURE,
                            batteryInletTemperature: self.obd2Data.BATTERY_INLET_TEMPERATURE
                        }, false, err => {
                            // TODO: if err.status===0, the request failed because of a timeout, which most likely means that there is no internet connection. We could collect all of these failed requests and push them later to keep history.
                            self.syncEventEmitter(err, 'upload');
                            if (typeof callback === 'function') callback(err);
                        }, 10000);
                    } else if (typeof callback === 'function') callback(err);
                }, 10000);
            },
            pullData() {
                var self = this;

                // get soc data
                http.sendRequest('GET', 'soc', {
                    akey: storage.getValue('akey'),
                    token: storage.getValue('token')
                }, false, (err, res) => {
                    // TODO: if err.status===0, the request failed because of a timeout, which most likely means that there is no internet connection. We could collect all of these failed requests and push them later to keep history.
                    var baseData = self.$refs[self.car].getBaseData();

                    self.syncEventEmitter(err, 'download');

                    if (err || !res) return;
                    // extend with base data
                    Object.keys(baseData).forEach(key => Vue.set(self.obd2Data, key, baseData[key]));
                    // update soc info
                    Vue.set(self.obd2Data, 'SOC_DISPLAY', res.soc_display);
                    Vue.set(self.obd2Data, 'SOC_BMS', res.soc_bms);
                    self.timestamp = res.last_soc;
                    // get extended data
                    http.sendRequest('GET', 'extended', {
                        akey: storage.getValue('akey'),
                        token: storage.getValue('token')
                    }, false, (err, res) => {
                    // TODO: if err.status===0, the request failed because of a timeout, which most likely means that there is no internet connection. We could collect all of these failed requests and push them later to keep history.
                        self.syncEventEmitter(err, 'download');
                        if (err || !res) return;
                        // update extended data
                        Vue.set(self.obd2Data, 'SOH', res.soh);
                        Vue.set(self.obd2Data, 'CHARGING', res.charging);
                        Vue.set(self.obd2Data, 'RAPID_CHARGE_PORT', res.rapid_charge_port);
                        Vue.set(self.obd2Data, 'NORMAL_CHARGE_PORT', res.normal_charge_port);
                        Vue.set(self.obd2Data, 'SLOW_CHARGE_PORT', res.slow_charge_port);
                        Vue.set(self.obd2Data, 'AUX_BATTERY_VOLTAGE', res.aux_battery_voltage);
                        Vue.set(self.obd2Data, 'DC_BATTERY_VOLTAGE', res.dc_battery_voltage);
                        Vue.set(self.obd2Data, 'DC_BATTERY_CURRENT', res.dc_battery_current);
                        Vue.set(self.obd2Data, 'DC_BATTERY_POWER', res.dc_battery_power);
                        Vue.set(self.obd2Data, 'BATTERY_MIN_TEMPERATURE', res.battery_min_temperature);
                        Vue.set(self.obd2Data, 'BATTERY_MAX_TEMPERATURE', res.battery_max_temperature);
                        Vue.set(self.obd2Data, 'BATTERY_INLET_TEMPERATURE', res.battery_inlet_temperature);
                    }, 10000);
                }, 10000);
            },
            startWatch() {
                var self = this;

                // if push enabled, subscribe, otherwise unsubscribe
                if (window.cordova && window.FCMPlugin) {
                    if (self.push) FCMPlugin.subscribeToTopic(storage.getValue('token'));
                    else FCMPlugin.unsubscribeFromTopic(storage.getValue('token'));
                }

                // if device set and car supported, start watch
                if (self.device && self.supportedCars.indexOf(self.car) !== -1) {
                    self.bluetoothInterval = setInterval(() => {
                        var proceed = () => {
                            // wait, until currenct connect process finished
                            if (self.isWaitingForConnect) return;
                            self.isWaitingForConnect = true;
                            bluetoothSerial.isConnected(connected => {
                                self.isWaitingForConnect = self.showedBluetoothError = false;
                                // run init process if not already running
                                if (!self.initialized) {
                                    self.initialized = true;
                                    self.$refs[self.car].init();
                                }
                                eventBus.$emit('bluetoothChanged', 'connected');
                            }, disconnected => {
                                bluetoothSerial.connect(self.device, connected => {
                                    self.isWaitingForConnect = self.showedBluetoothError = false;
                                    // reset all obd2data again to prevent wrong notifications and data
                                    Object.keys(self.obd2Data).forEach(key => Vue.set(self.obd2Data, key, null));
                                    // force re-init (neccessary for re-connect?)
                                    self.communicationEstablished = self.initialized = false;
                                    // run init process if not already running
                                    if (!self.initialized) {
                                        self.initialized = true;
                                        self.$refs[self.car].init();
                                    }
                                    eventBus.$emit('bluetoothChanged', 'connected');
                                }, err => {
                                    if (self.syncMode === 'upload' || (!self.communicationEstablished && !self.showedBluetoothError)) {
                                        self.showedBluetoothError = true;
                                        self.$refs.snackbar.setMessage('BLUETOOTH_CONNECT_ERROR', (self.syncMode === 'upload'), 'error');
                                    } else if (self.initialized) {
                                        self.$refs.snackbar.setMessage('BLUETOOTH_CONNECT_ERROR', false, 'error');
                                    }
                                    self.initialized = self.isWaitingForConnect = false;
                                    eventBus.$emit('bluetoothChanged', 'disabled');
                                });
                            });
                        };

                        // prevent bluetooth connection if download syncMode forced
                        if (self.syncMode === 'download') return;
                        bluetoothSerial.isEnabled(enabled => {
                            proceed();
                        }, disabled => {
                            // ensure if bluetooth auto enable is activated by user
                            if (!storage.getValue('autobluetooth', true)) return;
                            if (self.isWaitingForEnable) return; // there is already a dialog to wait for acceptance
                            self.isWaitingForEnable = true;
                            eventBus.$emit('bluetoothChanged', 'searching');
                            bluetoothSerial.enable(enabled => {
                                self.isWaitingForEnable = false;
                                proceed();
                            }, err => {
                                // user has not allowed to enable bluetooth, save it for future
                                storage.setValue('autoboot', false);
                                self.initialized = false;
                                self.$refs.snackbar.setMessage('BLUETOOTH_ENABLE_ERROR', true, 'error');
                                eventBus.$emit('bluetoothChanged', 'disabled');
                            });
                        });
                    }, 1000);
                    // apply the sync interval handler to be able to call directly on start and on each interval
                    self.syncIntervalHandler = () => {
                        // check if sync modes has been forced
                        if (self.syncMode === 'download') {
                            // simply retrieve the data
                            self.pullData();
                        } else {
                            // check if connected or not to determine if we need to push or pull soc
                            bluetoothSerial.isConnected(connected => {
                                if (self.communicationEstablished && (self.obd2Data.SOC_DISPLAY || self.obd2Data.SOC_BMS)) {
                                    // push soc
                                    self.pushData();
                                }
                            }, disconnected => {
                                // retrieve state of charge from sync only, if no obd2Data received or if data is too old
                                if (!self.lastResponse || self.lastResponse + 15 < parseInt(new Date().getTime() / 1000)) {
                                    // get data if not in upload
                                    if (self.syncMode !== 'upload') self.pullData();
                                }
                            });
                        }
                    };
                    // the sync interval
                    self.syncInterval = setInterval(() => {
                        self.syncIntervalHandler();
                    }, 10000);
                    // listener for location changes to push location to server
                    if (storage.getValue('locationsync')) {
                        self.locationWatcher = navigator.geolocation.watchPosition((pos) => {
                            // send location if communication is established
                            if (!self.communicationEstablished) return;
                            http.sendRequest('POST', 'location', {
                                akey: storage.getValue('akey'),
                                token: storage.getValue('token'),
                                location: {
                                    latitude: pos.coords.latitude,
                                    longitude: pos.coords.longitude,
                                    speed: pos.coords.speed,
                                    timestamp: pos.timestamp,
                                    accuracy: pos.coords.accuracy
                                }
                            }, err => { 
                                // TODO: if err.status===0, the request failed because of a timeout, which most likely means that there is no internet connection. We could collect all of these failed requests and push them later to keep history. 
                            }, 1000);
                        }, err => console.log(err), {
                            maximumAge: 2000,
                            timeout: 5000,
                            enableHighAccuracy: true
                        });
                    }
                    // watch for charging interrupted
                    self.chargingWatcher = setInterval(() => {
                        var soc = self.obd2Data.SOC_DISPLAY || self.obd2Data.SOC_BMS;

                        // validate if there was at least one successful response and charging started earlier
                        if (self.lastResponse && self.chargingStarted && soc && !self.errorNotificationSent) {
                            if (parseInt(new Date().getTime() / 1000) > self.lastResponse + 300) {
                                // no response.. check if still connected and not charging normally ended
                                bluetoothSerial.isConnected(connected => {
                                    if (((self.obd2Data.SLOW_CHARGE_PORT || self.obd2Data.NORMAL_CHARGE_PORT) && Math.ceil(soc) !== 100) || 
                                        (self.obd2Data.RAPID_CHARGE_PORT && Math.ceil(soc) !== 94)) {
                                        // still plugged in.. sent out error notificaiton
                                        http.sendRequest('POST', 'notification', {
                                            akey: storage.getValue('akey'),
                                            token: storage.getValue('token'),
                                            abort: true,
                                            debug: {
                                                lastResponse: self.lastResponse,
                                                now: parseInt(new Date().getTime() / 1000),
                                                obd2Data: self.obd2Data
                                            }
                                        }, false, err => {
                                            if (!err) self.errorNotificationSent = true;
                                        });
                                    }
                                }, err => console.log(err));
                            }
                        }
                    }, 10000);

                    // Watch lastResponse to force standy mode on no valid data after a specific time
                    self.standbyWatcher = setInterval(() => {
                        if (typeof bluetoothSerial !== 'undefined' && self.lastResponse && parseInt(new Date().getTime() / 1000) > self.lastResponse + 600) {
                            // no valid response in 10 minutes detected, force standby
                            self.clear();
                            self.$refs[self.car].standbyMode();
                        }
                    }, 60000);

                    // listen for sync mode changes (on debug settings forceSyncModes enabled)
                    eventBus.$off('forcedSyncMode');
                    if (self.debugSettings.forceSyncModes) {
                        eventBus.$on('forcedSyncMode', function(type) {
                            self.syncMode = type;
                            self.$emit('syncModeChanged', type);
                            // reset all keys
                            for (var key in self.obd2Data) {
                                if (self.obd2Data.hasOwnProperty(key)) {
                                    Vue.set(self.obd2Data, key, 0);
                                }
                            }
                            if (self.syncMode === 'download') {
                                // disconnect from obd2 device
                                bluetoothSerial.disconnect(() => {
                                    self.communicationEstablished = self.initialized = false;
                                }, () => self.communicationEstablished = self.initialized = false);
                            }
                            self.syncIntervalHandler(); // force new sync
                        });
                        eventBus.$emit('forcedSyncMode', (self.syncMode = storage.getValue('lstSyncMode', 'download')));
                        eventBus.$emit('syncModeChanged', self.syncMode);
                    } else self.syncIntervalHandler(); // start sync on beginning
                } else self.$refs.snackbar.setMessage(((!self.device) ? 'NO_DEVICE_SELECTED' : 'NO_CAR_SELECTED'), true, 'warning');
                
                // plugin handling based on local device settings
                window.plugins.insomnia[((storage.getValue('keepawake') ? 'keepAwake' : 'allowSleepAgain'))]();
                cordova.plugins.autoStart[((storage.getValue('autoboot') ? 'enable' : 'disable'))]();
            },
            debugInfo() {
                this.$refs.snackbar.setMessage('DEBUG_MODE_' + ((DEBUG) ? 'ENABLED' : 'DISABLED'));
            },
            estimate() {
                var soc = this.obd2Data.SOC_DISPLAY || this.obd2Data.SOC_BMS;

                if (typeof soc !== 'number' || isNaN(soc) ||
                    typeof this.consumption !== 'number' || isNaN(this.consumption) ||
                    typeof this.obd2Data.CAPACITY !== 'number' || isNaN(this.obd2Data.CAPACITY)) {
                    this.estimatedRangeCurrent = this.estimatedRangeTotal = this.estimatedSlowTime = this.estimatedNormalTime =
                        this.estimatedFastTime = 0;
                    this.batteryIcon = 'icons/battery_unknown.svg';
                } else {
                    // calculate range
                    this.estimatedRangeTotal = parseInt((this.obd2Data.CAPACITY / this.consumption) * 100) || 0;
                    this.estimatedRangeCurrent = parseInt(this.estimatedRangeTotal * ((soc === 100) ? 1 :
                        '0.' + ((soc < 10) ? ('0' + parseInt(soc)) : parseInt(soc)))) || 0;
                    // calculate time
                    if (this.obd2Data.SLOW_SPEED >= 0 && this.obd2Data.NORMAL_SPEED >= 0 && this.obd2Data.FAST_SPEED >= 0) {
                        var amountToCharge = this.obd2Data.CAPACITY - parseFloat(this.obd2Data.CAPACITY * ((soc === 100) ?
                            1 :
                            '0.' + ((soc < 10) ? ('0' + parseInt(soc)) : parseInt(soc)))).toFixed(2) || 0,
                            realChargingSpeed = ((this.obd2Data.CHARGING && this.obd2Data.DC_BATTERY_POWER) ? (this.obd2Data.DC_BATTERY_POWER * -1) : false);

                        this.estimatedSlowTime = parseFloat((amountToCharge / (realChargingSpeed || this.obd2Data.SLOW_SPEED)).toFixed(2));
                        this.estimatedNormalTime = parseFloat((amountToCharge / (realChargingSpeed || this.obd2Data.NORMAL_SPEED)).toFixed(2));
                        this.estimatedFastTime = parseFloat((amountToCharge / (realChargingSpeed || this.obd2Data.FAST_SPEED)).toFixed(2));
                    }
                    // set icon based on soc
                    this.batteryIcon = 'icons/battery_' + ((this.obd2Data.CHARGING) ? 'charging_' : '') + (
                        Math.ceil((((soc === 100) ? 99 : parseInt(soc)) + 1) / 5) * 5
                    ) + '.svg';
                }
            },
            initMessage() {
                if (this.initialized) this.$refs.snackbar.setMessage('INITIALIZATION');
            },
            communicationMessage() {
                if (this.communicationEstablished) this.$refs.snackbar.setMessage('ESTABLISHED', false, 'success');
            },
            clear() {
                clearInterval(this.bluetoothInterval);
                clearInterval(this.syncInterval);
                clearInterval(this.chargingWatcher);
                clearInterval(this.standbyWatcher);
                if (typeof bluetoothSerial !== 'undefined') bluetoothSerial.unsubscribe();
                if (this.locationWatcher) navigator.geolocation.clearWatch(this.locationWatcher);
                this.$refs.snackbar.setMessage('STANDBY_MODE_ACTIVATED', false, 'warning');
            }
        },
        components: {
            bottomBar,
            snackbar,
            toolbar,
            AMPERAE,
            IONIQBEV,
            IONIQHEV,
            IONIQPHEV,
            SOULEV,
            KONAEV
        },
        beforeDestroy() {
            this.clear();
        },
        created() {
            var self = this;

            self.translated = translation.translatePage();
            self.push = storage.getValue('settings', {}).push;
            self.device = storage.getValue('settings', {}).device;
            self.car = storage.getValue('settings', {}).car;
            self.consumption = parseFloat(storage.getValue('settings', {}).consumption) || 0;
            self.socThreshold = parseInt(storage.getValue('settings', {}).soc) || 0;
            self.debugSettings = storage.getValue('debugSettings', {});

            // apply backbuttonPressed listener to handle exit or back
            eventBus.$off('backbuttonPressed');
            eventBus.$on('backbuttonPressed', function (e) {
                if (self.$route.path === '/dashboard' || self.$route.path === '/') {
                    e.preventDefault();
                    // end bluetooth connection, force standby mode
                    self.clear();
                    if (typeof bluetoothSerial === 'undefined') return navigator.app.exitApp();
                    bluetoothSerial.isConnected(connected => {
                        // emit forceStandby - on finish, close app
                        try {
                            eventBus.$off('standby');
                            eventBus.$on('standby', err => {
                                // TODO we should inform the user, that standby mode was not successful
                                navigator.app.exitApp();    
                            });
                            self.$refs[self.car].standbyMode();
                        } catch (err) {
                            navigator.app.exitApp();
                        }
                    }, disconnected => navigator.app.exitApp());
                } else navigator.app.backHistory();
            });
            // listen to obd2Data (we can not use once here)
            eventBus.$off('obd2Data');
            eventBus.$on('obd2Data', function (data) {
                // update / extend local obd2 data - use Vue.set due to reactivity
                Object.keys(data).forEach(key => Vue.set(self.obd2Data, key, data[key]));
                var soc = self.obd2Data.SOC_DISPLAY || self.obd2Data.SOC_BMS;
                var socType = self.obd2Data.SOC_DISPLAY ? 'DISPLAY' : 'BMS';

                if (soc == null) return; // no valid data
                // set current timestamp and update last car response activity
                if (data.SOC_DISPLAY || data.SOC_BMS) self.timestamp = self.lastResponse = parseInt(new Date().getTime() / 1000);
                // inform user once about success
                if (!self.communicationEstablished) self.communicationEstablished = true;
                // reset charging started info if no longer charging
                if (self.chargingStarted && !self.obd2Data.CHARGING) {
                    self.chargingStarted = false;
                    self.chargingStartSOC = 0;
                }
                // track charging started
                if (self.obd2Data.CHARGING) {
                    self.chargingStarted = true;
                    if (!self.chargingStartSOC) self.chargingStartSOC = soc;
                }
                // soc threshold watcher
                if (self.obd2Data.CHARGING && self.chargingStartSOC < self.socThreshold && soc >= self.socThreshold && !self.notificationSent) {
                    self.notificationSent = true;
                    self.usedNotificationType = socType;
                    // update current state of charge
                    self.pushData(err => {
                        if (!err) {
                            // sent notification that soc has reached
                            http.sendRequest('POST', 'notification', {
                                akey: storage.getValue('akey'),
                                token: storage.getValue('token'),
                                debug: {
                                    chargingStartSOC: self.chargingStartSOC,
                                    threshold: self.socThreshold,
                                    now: parseInt(new Date().getTime() / 1000),
                                    obd2Data: self.obd2Data
                                }
                            }, false, err => {
                                if (err) self.notificationSent = false;
                            });
                        } else self.notificationSent = false;
                    });
                } else if (self.notificationSent && soc && socType === self.usedNotificationType && soc < self.socThreshold) {
                    // reset notification sent
                    self.notificationSent = false;
                }
            });
            eventBus.$off('obd2Error');
            eventBus.$on('obd2Error', function (error) {
                self.$refs.snackbar.setMessage('OBD2_ERROR', false, 'warning');
                // disconnect from obd2 device - this seems to probably solve the issue when buffer is full (to force full re-init)
                bluetoothSerial.disconnect(() => {
                    self.communicationEstablished = self.initialized = false;
                }, () => self.communicationEstablished = self.initialized = false);
            });
            // wakeup listener
            eventBus.$off('wakeup');
            eventBus.$on('wakeup', () => {
                self.$refs.snackbar.setMessage('STANDBY_MODE_DEACTIVATED', false, 'success');
                self.communicationEstablished = self.initialized = false;
                self.startWatch();
            });
        },
        mounted() {
            var self = this;

            // wait for cordova device to be ready - apply listener, if not ready yet
            eventBus.$off('deviceReady');
            if (self.$root.deviceReady) self.startWatch();
            else {
                eventBus.$on('deviceReady', function () {
                    self.startWatch();
                });
            }
        }
    }
</script>

<style>
.vueperslides__arrows .vueperslides__arrow {
    fill: #448aff;
}
</style>
