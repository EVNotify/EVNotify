<!-- The Dashboard Page -->
<template>
    <div>
        <toolbar></toolbar>
        <div class="content-within-page">
            <div class="md-layout md-gutter md-alignment-center dashboard-card-list">
                <md-card class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100">
                    <md-card-header>
                        <md-card-media>
                            <img src="icons/battery_unknown.svg">
                        </md-card-media>
                        <md-card-header-text>
                            <div class="md-title">{{ soc }}%</div>
                            <div class="md-subhead">State of charge</div>
                            <md-divider></md-divider>
                            <div>
                                <img src="icons/sync.svg">Updated now
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
                            <div class="md-title">0km</div>
                            <div class="md-subhead">Estimated range</div>
                            <md-divider></md-divider>
                            <div>
                                <img src="icons/ev_station.svg">10.6kWh/100km
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
                                    <li>0m</li>
                                    <li>0m</li>
                                    <li>0m</li>
                                </ul>
                            </div>
                            <div class="md-subhead">Estimated time</div>
                            <md-divider></md-divider>
                            (Slow, Normal, Fast)
                        </md-card-header-text>
                    </md-card-header>
                </md-card>
            </div>
        </div>
        <IONIQBEV ref="IONIQ_BEV"></IONIQBEV>
        <md-snackbar md-position="center" :md-persistent="true" :md-active.sync="showSidebar">
            <span>No OBDII-bluetooth device selected</span>
        </md-snackbar>
        <bottom-bar></bottom-bar>
    </div>
</template>

<script>
    import toolbar from './../container/toolbar.vue';
    import storage from './../modules/storage.vue';
    import eventBus from './../modules/event.vue';
    import bottomBar from './../container/bottom-bar.vue';
    import IONIQBEV from './../cars/IONIQ_BEV.vue';
    import SOULEV from './../cars/SOUL_EV.vue';

    export default {
        data() {
            return {
                soc: 0,
                showSidebar: false,
                interval: 0,
                device: null,
                car: null,
                supportedCars: ['IONIQ_BEV', 'SOUL_EV'],
                initialized: false
            };
        },
        methods: {
            startWatch() {
                var self = this;

                // if device set and car supported, start watch
                if (self.device && self.supportedCars.indexOf(self.car) !== -1) {
                    self.interval = setInterval(() => {
                        var proceed = () => {
                            bluetoothSerial.isConnected(connected => {
                                // run init process if not already running
                                if (!self.initialized) {
                                    self.initialized = true;
                                    self.$refs[self.car].init();
                                }
                            }, disconnected => {
                                bluetoothSerial.connect(self.device, connected => {
                                    // run init process if not already running
                                    if (!self.initialized) {
                                        self.initialized = true;
                                        self.$refs[self.car].init();
                                    }
                                }, err => console.error(err));
                            });
                        };

                        bluetoothSerial.isEnabled(enabled => {
                            proceed();
                        }, disabled => {
                            bluetoothSerial.enable(enabled => {
                                proceed();
                            }, err => console.error(err));
                        });
                    }, 1000);
                } else self.showSidebar = true;
            }
        },
        components: {
            bottomBar,
            toolbar,
            IONIQBEV,
            SOULEV
        },
        beforeDestroy() {
            clearInterval(this.interval);
        },
        created() {
            var self = this;

            self.device = storage.getValue('settings', {}).device;
            self.car = storage.getValue('settings', {}).car;

            // wait for cordova device to be ready - apply listener, if not ready yet
            if (self.$root.deviceReady) self.startWatch();
            else {
                eventBus.$on('deviceReady', function () {
                    self.startWatch();
                });
            }
            eventBus.$on('obd2Data', function (data) {
                self.soc = data.SOC_DISPLAY || 0;
            });
        }
    }
</script>