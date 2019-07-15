<!-- The Dashboard Page -->
<template>
    <div>
        <!-- <v-tour name="dashboard-tour" :steps="steps" :callbacks="tourCallbacks"></v-tour> -->
        <toolbar @debugChanged="debugInfo()" class="v-step-1"></toolbar>
        <div class="content-within-page">
            <v-layout>
                <v-flex xs12 sm6 offset-sm3>
                <v-card>
                    <v-card-title primary-title>
                    <div class="upper-part">
                        <div class="progress-cycle-container left">
                        <v-progress-circular :rotate="-90" :size="100" :width="15"
                            :value="(obd2Data.SOC_DISPLAY || obd2Data.SOC_BMS) || 0" :color="cycleColor">
                            <div class="progress-cycle-text-container">
                            <p>{{ (obd2Data.SOC_DISPLAY || obd2Data.SOC_BMS) || 0 }} %</p>
                            <v-icon color="primary" v-if="obd2Data.CHARGING">flash_on</v-icon>
                            </div>
                        </v-progress-circular>
                        <p class="caption progress-cycle-text" v-if="obd2Data.SOC_DISPLAY">{{ translated.SOC_DISPLAY }}</p>
                        <p class="caption progress-cycle-text" v-else>{{ translated.SOC_BMS }}</p>
                        </div>
                        <div class="progress-cycle-container right">
                        <v-list>
                            <v-list-tile>
                            <v-list-tile-action>
                                <v-btn flat icon :ripple="false">
                                    <img src="icons/blue/flash.svg" />
                                </v-btn>
                            </v-list-tile-action>
                            <v-list-tile-content>
                                <v-list-tile-title :style="{color: powerAmountColor}">{{ powerAmount }} kW</v-list-tile-title>
                                <span v-if="obd2Data.CHARGING" class="font-weight-light font-italic">{{ rangePerMinute }} km / min</span>
                            </v-list-tile-content>
                            </v-list-tile>
                            <v-list-tile v-if="supportedCars.indexOf(car) !== -1">
                            <v-list-tile-action>
                                <v-btn flat icon :ripple="false">
                                    <img src="icons/blue/car.svg" />
                                </v-btn>
                            </v-list-tile-action>
                            <v-list-tile-content>
                                <v-list-tile-title :style="{color: currentRangeColor}">{{ currentRange }} / {{ totalRange }} km</v-list-tile-title>
                                <span class="font-weight-light font-italic">{{ consumption || 0 }} kWh / 100 km</span>
                            </v-list-tile-content>
                            </v-list-tile>
                            <v-list-tile v-if="obd2Data.CHARGING && supportedCars.indexOf(car) !== -1">
                            <v-list-tile-action>
                                <v-btn flat icon :ripple="false">
                                    <img src="icons/blue/schedule.svg" />
                                </v-btn>
                            </v-list-tile-action>
                            <v-list-tile-content>
                                <v-list-tile-title>{{ chargingTimeLeft }} h ({{ finishTime }})</v-list-tile-title>
                            </v-list-tile-content>
                            </v-list-tile>
                        </v-list>
                        </div>
                    </div>
                    <small class="updated-timestamp" v-if="!dataOutdated()">{{ updatedTimestamp }}</small>
                    <v-alert type="warning" :value="dataOutdated()" transition="scale-transition">
                        {{ dataOutdatedMessage }}<br>
                        <small>{{ dataOutdatedMessageTimestamp }}</small>
                    </v-alert>
                    <div class="bottom-part">
                        <v-list two-line>
                        <v-subheader>{{ translated.BATTERY_TEMPERATURE }}</v-subheader>
                        <v-list-tile>
                            <v-list-tile-action>
                                <v-btn flat icon :ripple="false">
                                    <img src="icons/blue/cold.svg" />
                                </v-btn>
                            </v-list-tile-action>
                            <v-list-tile-content>
                            <v-list-tile-title>
                                <p class="temperature-text" :style="{color: getTemperatureColor(obd2Data.BATTERY_MIN_TEMPERATURE)}">
                                {{ obd2Data.BATTERY_MIN_TEMPERATURE || 0 }}
                                </p> /
                                <p class="temperature-text" :style="{color: getTemperatureColor(obd2Data.BATTERY_MAX_TEMPERATURE)}">
                                {{ obd2Data.BATTERY_MAX_TEMPERATURE || 0 }}
                                </p> /
                                <p class="temperature-text"
                                :style="{color: getTemperatureColor(obd2Data.BATTERY_INLET_TEMPERATURE)}">
                                {{ obd2Data.BATTERY_INLET_TEMPERATURE || 0 }}
                                </p> °C
                            </v-list-tile-title>
                                <v-list-tile-sub-title>{{ translated.BATTERY_TEMPERATURE_SHORTS }}</v-list-tile-sub-title>
                            </v-list-tile-content>
                        </v-list-tile>
                        <v-subheader>{{ translated.BATTERY_DATA }}</v-subheader>
                        <v-list-tile>
                            <v-list-tile-action>
                                <v-btn flat icon :rippled="false">
                                    <img src="icons/blue/battery_charging_100.svg" />
                                </v-btn>
                            </v-list-tile-action>
                            <v-list-tile-content>
                                <v-list-tile-title>{{ obd2Data.DC_BATTERY_VOLTAGE || 0 }} V</v-list-tile-title>
                                <v-list-tile-sub-title>{{ translated.DC_BATTERY_VOLTAGE }}</v-list-tile-sub-title>
                            </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile>
                            <v-list-tile-action>
                                <v-btn flat icon :rippled="false">
                                    <img src="icons/blue/power.svg" />
                                </v-btn>
                            </v-list-tile-action>
                            <v-list-tile-content>
                                <v-list-tile-title>{{ roundTo2Digits(obd2Data.DC_BATTERY_CURRENT) || 0 }} A</v-list-tile-title>
                                <v-list-tile-sub-title>{{ translated.DC_BATTERY_CURRENT }}</v-list-tile-sub-title>
                            </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile class="double-line">
                            <v-list-tile-action>
                                <v-btn flat icon :rippled="false">
                                    <img src="icons/blue/battery_unknown.svg" />
                                </v-btn>
                            </v-list-tile-action>
                            <v-list-tile-content>
                                <v-list-tile-title>{{ obd2Data.CUMULATIVE_ENERGY_CHARGED || 0 }} kWh / {{ obd2Data.CUMULATIVE_ENERGY_DISCHARGED || 0 }} kWh</v-list-tile-title>
                                <v-list-tile-sub-title>{{ translated.CUMULATIVE_ENERGY_CHARGED }} / <br>{{ translated.CUMULATIVE_ENERGY_DISCHARGED }}</v-list-tile-sub-title>
                            </v-list-tile-content>
                        </v-list-tile>
                        <v-subheader>{{ translated.BATTERY_HEALTH }}</v-subheader>
                        <v-list-tile v-if="obd2Data.SOC_DISPLAY">
                            <v-list-tile-action>
                                <v-btn flat icon :rippled="false">
                                    <img src="icons/blue/battery_100.svg" />
                                </v-btn>
                            </v-list-tile-action>
                            <v-list-tile-content>
                                <v-list-tile-title>{{ obd2Data.SOC_BMS || 0 }} %</v-list-tile-title>
                                <v-list-tile-sub-title>{{ translated.SOC_BMS }}</v-list-tile-sub-title>
                            </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile>
                            <v-list-tile-action>
                                <v-btn flat icon :rippled="false">
                                    <img src="icons/blue/favorite.svg" />
                                </v-btn>
                            </v-list-tile-action>
                            <v-list-tile-content>
                                <v-list-tile-title>{{ obd2Data.SOH || 0 }} %</v-list-tile-title>
                                <v-list-tile-sub-title>{{ translated.SOH }}</v-list-tile-sub-title>
                            </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile class="last-tile">
                            <v-list-tile-action :rippled="false">
                                <v-btn flat icon>
                                    <img src="icons/blue/flash_auto.svg" />
                                </v-btn>
                            </v-list-tile-action>
                            <v-list-tile-content>
                                <v-list-tile-title>{{ obd2Data.AUX_BATTERY_VOLTAGE || 0 }} V</v-list-tile-title>
                                <v-list-tile-sub-title>{{ translated.AUX_BATTERY_VOLTAGE }}</v-list-tile-sub-title>
                            </v-list-tile-content>
                        </v-list-tile>
                        </v-list>
                    </div>
                    </v-card-title>
                </v-card>
                </v-flex>
            </v-layout>
        </div>
        <AMPERAE ref="AMPERA_E"></AMPERAE>
        <BOLTEV ref="BOLT_EV"></BOLTEV>
        <IONIQBEV ref="IONIQ_BEV"></IONIQBEV>
        <IONIQHEV ref="IONIQ_HEV"></IONIQHEV>
        <IONIQPHEV ref="IONIQ_PHEV"></IONIQPHEV>
        <SOULEV ref="SOUL_EV"></SOULEV>
        <KONAEV ref="KONA_EV"></KONAEV>
        <ZOEQ210 ref="ZOE_Q210"></ZOEQ210>
        <NIROEV ref="NIRO_EV"></NIROEV>
        <snackbar ref="snackbar"></snackbar>
        <bottom-bar class="v-step-3"></bottom-bar>
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
    import BOLTEV from './../cars/BOLT_EV.vue';
    import IONIQBEV from './../cars/IONIQ_BEV.vue';
    import IONIQHEV from './../cars/IONIQ_HEV.vue';
    import IONIQPHEV from './../cars/IONIQ_PHEV.vue';
    import SOULEV from './../cars/SOUL_EV.vue';
    import KONAEV from './../cars/KONA_EV.vue';
    import ZOEQ210 from './../cars/ZOE_Q210.vue';
    import NIROEV from './../cars/NIRO_EV.vue';

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
                chargingStarted: 0,
                chargingStartSOC: 0,
                lastResponse: 0,
                obd2ErrorCount: 0,
                consumption: 0,
                supportedCars: ['IONIQ_BEV', 'IONIQ_HEV', 'IONIQ_PHEV', 'SOUL_EV', 'AMPERA_E', 'BOLT_EV', 'KONA_EV', 'ZOE_Q210', 'NIRO_EV'],
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
                syncMode: '',
                steps: [{
                    target: '.v-step-1',
                    content: 'TOUR_DASHBOARD_1'
                }, {
                    target: '.v-step-2',
                    content: 'TOUR_DASHBOARD_2'
                }, {
                    target: '.v-step-3',
                    content: 'TOUR_DASHBOARD_3'
                }],
                updatedTimestamp: '',
                dataOutdatedMessage: '',
                dataOutdatedMessageTimestamp: '',
                tourCallbacks: {
                    onStop: () => {
                        storage.setValue('tour_completed_dashboard', true);
                    }
                }
            };
        },
        watch: {
            'obd2Data.SOC_DISPLAY': 'estimate',
            'obd2Data.CHARGING': 'estimate',
            'obd2Data.DC_BATTERY_POWER': 'estimate',
            'initialized': 'initMessage',
            'communicationEstablished': 'communicationMessage'
        },
        computed: {
            cycleColor() {
                const soc = this.obd2Data.SOC_DISPLAY || this.obd2Data.SOC_BMS;

                if (soc < 15) return 'red';
                else if (soc < 30) return 'orange';
                else if (soc < 50) return 'yellow';
                return 'green';
            },
            powerAmount() {
                return (Math.abs(this.obd2Data.DC_BATTERY_POWER) || 0).toFixed(2);
            },
            powerAmountColor() {
                if (this.obd2Data.CHARGING) return 'green';
                return parseFloat(this.obd2Data.DC_BATTERY_POWER) <= 0 ? '#448aff' : 'red';
            },
            totalRange() {
                return parseInt((this.obd2Data.CAPACITY / this.consumption) * 100) || 0;
            },
            currentRange() {
                const soc = this.obd2Data.SOC_DISPLAY || this.obd2Data.SOC_BMS;

                return parseInt(this.totalRange * ((soc === 100) ? 1 : '0.' + ((soc < 10) ? ('0' + parseInt(soc)) :
                parseInt(soc)))) || 0;
            },
            currentRangeColor() {
                if (this.currentRange < (this.totalRange * 10 / 100)) {
                return 'red';
                }
                return 'green';
            },
            rangePerMinute() {
                const time = helper.chargeDecimalTime(this.obd2Data.CAPACITY, this.obd2Data.SOC_DISPLAY, this.obd2Data.SOC_BMS, this.obd2Data.DC_BATTERY_POWER || this.obd2Data.FAST_SPEED);
                return (parseFloat((this.totalRange - this.currentRange) / (60 / 100 * time * 100)) || 0).toFixed(2);
            },
            chargingTimeLeft() {
                return helper.chargeTime(this.obd2Data.CAPACITY, this.obd2Data.SOC_DISPLAY, this.obd2Data.SOC_BMS, this.obd2Data.DC_BATTERY_POWER || this.obd2Data.FAST_SPEED, "timeleft");
            },
            finishTime() {
                return helper.chargeTime(this.obd2Data.CAPACITY, this.obd2Data.SOC_DISPLAY, this.obd2Data.SOC_BMS, this.obd2Data.DC_BATTERY_POWER || this.obd2Data.FAST_SPEED, "finishtime");
            },
        },
        methods: {
            dataOutdated() {
                const now = parseInt(new Date() / 1000);
                const lastUpdate = this.timestamp;

                if(!lastUpdate) {
                    this.dataOutdatedMessage = translation.translate('DATA_OUTDATED_NEVER_CONNECTED');
                } else {
                    this.dataOutdatedMessage = translation.translate('DATA_OUTDATED_WITH_TIMESTAMP') + this.$root.MomentJS(new Date(lastUpdate * 1000)).fromNow() + '.';
                    this.dataOutdatedMessageTimestamp = `(${this.$root.MomentJS(new Date(lastUpdate * 1000)).format('MMMM Do YYYY HH:mm')})`;
                }
                return !lastUpdate || lastUpdate + 600 < now;
            },
            getTemperatureColor(temperature) {
                if (temperature < 20) return 'blue';
                else if (temperature < 30) return 'green';
                else if (temperature < 35) return 'orange';
                return 'red';
            },
            updateTimestamp () {
                const lastUpdate = this.timestamp;

                if (!lastUpdate) this.updatedTimestamp = translation.translate('DATA_UPDATED_NEVER');
                else this.updatedTimestamp = translation.translate('DATA_UPDATED_TEXT') + this.$root.MomentJS(new Date(lastUpdate * 1000)).fromNow() + ' [' + this.$root.MomentJS(new Date(lastUpdate) * 1000).format('HH:mm:ss') + ']';
            },
            formatChargingTime(timestamp) {
                return helper.convertDecimalTime(parseInt(new Date().getTime() / 1000) - timestamp) + 'h';
            },
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
                            cumulativeEnergyCharged: self.obd2Data.CUMULATIVE_ENERGY_CHARGED,
                            cumulativeEnergyDischarged: self.obd2Data.CUMULATIVE_ENERGY_DISCHARGED,
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
                    self.updateTimestamp();
                    self.updateNotification(self.obd2Data.SOC_DISPLAY || self.obd2Data.SOC_BMS);
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
                        Vue.set(self.obd2Data, 'CUMULATIVE_ENERGY_CHARGED', res.cumulative_energy_charged);
                        Vue.set(self.obd2Data, 'CUMULATIVE_ENERGY_DISCHARGED', res.cumulative_energy_discharged);
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
                            }, false, err => { 
                                // TODO: if err.status===0, the request failed because of a timeout, which most likely means that there is no internet connection. We could collect all of these failed requests and push them later to keep history. 
                            }, 2000);
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
                        if (typeof bluetoothSerial !== 'undefined' && ((self.lastResponse && parseInt(new Date().getTime() / 1000) > self.lastResponse + 600) || self.obd2ErrorCount >= 42)) {
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
                } else {
                    // the sync interval
                    self.syncInterval = setInterval(() => {
                        self.pullData();
                    }, 10000);
                    self.pullData();
                    self.$refs.snackbar.setMessage(((!self.device) ? 'NO_DEVICE_SELECTED' : 'NO_CAR_SELECTED'), !!self.device, 'warning');
                }
                
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
            },
            updateNotification(soc) {
                var debugSettings = storage.getValue('debugSettings', {});

                if (debugSettings.persistentNotification) {
                    cordova.plugins.notification.local.update({
                        id: 42,
                        text: 'SOC: ' + soc + '%',
                        priority: 1
                    });
                }
                if (debugSettings.backgroundMode) {
                    cordova.plugins.backgroundMode.configure({
                        title: 'EVNotify',
                        text: 'SOC: ' + soc + '%'
                    });
                }
            }
        },
        components: {
            bottomBar,
            snackbar,
            toolbar,
            AMPERAE,
            BOLTEV,
            IONIQBEV,
            IONIQHEV,
            IONIQPHEV,
            SOULEV,
            KONAEV,
            ZOEQ210,
            NIROEV
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
                    cordova.plugins.notification.local.clearAll();
                    cordova.plugins.backgroundMode.disable();
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

                if (soc == null) return self.obd2ErrorCount++; // no valid data
                self.obd2ErrorCount = 0;
                // set current timestamp and update last car response activity
                if (data.SOC_DISPLAY || data.SOC_BMS) self.timestamp = self.lastResponse = parseInt(new Date().getTime() / 1000);
                else self.obd2ErrorCount++; // no valid data
                self.updateTimestamp();
                self.updateNotification(soc);
                // inform user once about success
                if (!self.communicationEstablished) self.communicationEstablished = true;
                // reset charging started info if no longer charging
                if (self.chargingStarted && !self.obd2Data.CHARGING) self.chargingStarted = self.chargingStartSOC = 0;
                // track charging started
                if (self.obd2Data.CHARGING) {
                    self.chargingStarted = parseInt(new Date().getTime() / 1000);
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
            // start the tour
            if (!storage.getValue('tour_completed_dashboard')) {
                // translate the tour and start afterwards
                self.steps.forEach(step => step.content = translation.translate(step.content));
                self.$tours['dashboard-tour'].start();
            }
        }
    }
</script>

<style scoped>
.v-alert {
    width: 100%;
}

.warning {
    background-color: #fb8c00 !important;
}

.layout {
    width: 100%;
}

.upper-part,
.bottom-part {
    width: 100%;
}

.updated-timestamp {
    padding: 0 16px;
}

.progress-cycle-container {
    width: 50%;
}
.progress-cycle-container .v-progress-circular {
    margin: auto;
    display: block;
}

.progress-cycle-container.left {
    padding-top: 16px;
    float: left;
}

.progress-cycle-container.right {
    float: right;
}

.progress-cycle-text {
    text-align: center;
    padding-top: 6px;
}

.progress-cycle-text-container p {
    margin-bottom: 0;
    text-align: center;
    color: #1976d2;
}
.progress-cycle-text-container i {
    color: #448aff;
}

.temperature-text {
    display: inline;
}

.last-tile {
    padding-bottom: 56px;
}
.v-card__title--primary {
    padding-top: 5px;
}
.v-subheader {
    height: 20px;
}
</style>

<style>
.vueperslides__arrows .vueperslides__arrow {
    fill: #448aff;
}
.v-list--two-line .v-list__tile {
    height: 60px;
}
.progress-cycle-container.right .v-list__tile {
    height: auto;
    padding: 0;
}
.v-list--two-line .double-line .v-list__tile {
    height: 70px;
}
</style>
