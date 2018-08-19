<template>
    <div>
        <toolbar></toolbar>
        <md-list class="content-within-page" md-expand-single="true">
            <form class="form inner-form">
                <md-subheader>{{ translated.GENERAL }}</md-subheader>
                <md-list-item md-expand>
                    <md-icon md-src="icons/language.svg"></md-icon>
                    <span class="md-list-item-text">{{ translated.LANGUAGE}}</span>
                    <md-list slot="md-expand">
                        <md-field>
                            <label for="lng">{{ translated.LANGUAGE }}</label>
                            <md-select v-model="settings.lng" required>
                                <md-option value="de">{{ translated.GERMAN }}</md-option>
                                <md-option value="en">{{ translated.ENGLISH }}</md-option>
                            </md-select>
                        </md-field>
                    </md-list>
                </md-list-item>
                <md-subheader>{{ translated.USER }}</md-subheader>
                <md-list-item md-expand>
                    <md-icon md-src="icons/account_circle.svg"></md-icon>
                    <span class="md-list-item-text">{{ translated.CREDENTIALS }}</span>
                    <md-list slot="md-expand">
                        <md-field>
                            <label for="akey">AKey</label>
                            <md-input v-model="akey" disabled></md-input>
                        </md-field>
                        <md-field>
                            <label for="token">Token</label>
                            <md-input v-model="token" disabled type="password"></md-input>
                        </md-field>
                        <div class="md-layout">
                            <div class="md-layout-item">
                                <md-button class="md-accent" style="width: 95%">{{ translated.PASSWORD_CHANGE }}</md-button>
                            </div>
                            <div class="md-layout-item">
                                <md-button class="md-accent" style="width: 95%">{{ translated.TOKEN_RESET }}</md-button>
                            </div>
                        </div>
                    </md-list>
                </md-list-item>
                <md-subheader>{{ translated.CAR}}</md-subheader>
                <md-list-item md-expand>
                    <md-icon md-src="icons/car.svg"></md-icon>
                    <span class="md-list-item-text">{{ translated.CAR_SELECTION }}</span>
                    <md-list slot="md-expand">
                        <md-field>
                            <label for="car">{{ translated.CAR }}</label>
                            <md-select v-model="settings.car" required>
                                <md-option value="IONIQ_BEV">{{ translated.IONIQ_BEV }}</md-option>
                                <md-option value="SOUL_EV">{{ translated.SOUL_EV }}</md-option>
                            </md-select>
                        </md-field>
                    </md-list>
                </md-list-item>
                <md-list-item md-expand>
                    <md-icon md-src="icons/ev_station.svg"></md-icon>
                    <span class="md-list-item-text">{{ translated.CONSUMPTION }}</span>
                    <md-list slot="md-expand">
                        <md-field>
                            <label for="consumption">{{ translated.CONSUMPTION }}</label>
                            <md-input v-model="settings.consumption" type="number" placeholder="12.34" required></md-input>
                            <span class="md-suffix">kWh/100km</span>
                        </md-field>
                    </md-list>
                </md-list-item>
                <md-subheader>{{ translated.DEVICES }}</md-subheader>
                <md-list-item md-expand>
                    <md-icon md-src="icons/bluetooth_connected.svg"></md-icon>
                    <span class="md-list-item-text">{{ translated.OBD2_DEVICE }}</span>
                    <md-list slot="md-expand">
                        <md-field>
                            <label for="devices">{{ translated.OBD2_DEVICE }}</label>
                            <md-select v-model="settings.device" required>
                                <md-option v-for="(device, index) in devices" :key="index" :value="device.id">{{ device.name }}</md-option>
                            </md-select>
                        </md-field>
                    </md-list>
                </md-list-item>
                <md-list-item>
                    <md-icon md-src="icons/settings_brightness.svg"></md-icon>
                    <span class="md-list-item-text">{{ translated.KEEPAWAKE }}</span>
                    <md-switch v-model="keepawake"></md-switch>
                </md-list-item>
                <md-list-item>
                    <md-icon md-src="icons/launch.svg"></md-icon>
                    <span class="md-list-item-text">{{ translated.AUTOBOOT }}</span>
                    <md-switch v-model="autoboot"></md-switch>
                </md-list-item>
                <md-subheader>{{ translated.NOTIFICATIONS }}</md-subheader>
                <md-list-item md-expand>
                    <md-icon md-src="icons/notifications.svg"></md-icon>
                    <span class="md-list-item-text">{{ translated.NOTIFICATION_TYPES }}</span>
                    <md-list slot="md-expand">
                        <md-field>
                            <label for="email">{{ translated.EMAIL }}</label>
                            <md-input v-model="settings.email" type="email" placeholder="mail@example.com"></md-input>
                        </md-field>
                    </md-list>
                </md-list-item>
                <md-list-item md-expand>
                    <md-icon md-src="icons/notifications_active.svg"></md-icon>
                    <span class="md-list-item-text">{{ translated.NOTIFICATION_THRESHOLD }}</span>
                    <md-list slot="md-expand">
                        <md-field>
                            <input v-model.number="settings.soc" type="range" style="width: 100%">{{ settings.soc }}%
                            <span class="md-helper-text">{{ translated.SOC_THRESHOLD }}</span>
                        </md-field>
                        <div>
                            <md-checkbox v-model="settings.summary">{{ translated.SUMMARY }}</md-checkbox>
                        </div>
                    </md-list>
                </md-list-item>
                <md-subheader>{{ translated.DEVELOPER_OPTIONS }}</md-subheader>
                <md-list-item>
                    <small>Bug or feature?</small>
                </md-list-item>
            </form>
        </md-list>
        <md-snackbar md-position="center" :md-duration="4000" :md-active.sync="showSidebar" :md-persistent="true">
            <span v-if="saved">{{ translated.SETTINGS_SAVED }}</span>
            <span v-if="unexpectedError">{{ translated.UNEXPECTED_ERROR }}</span>
        </md-snackbar>
        <bottom-bar></bottom-bar>
    </div>
</template>

<script>
    import storage from './../modules/storage.vue';
    import translation from './../modules/translation.vue';
    import eventBus from './../modules/event.vue';
    import toolbar from './../container/toolbar.vue';
    import settings from './../container/settings.vue';
    import bottomBar from './../container/bottom-bar.vue';

    export default {
        data() {
            return {
                showSidebar: false,
                saved: false,
                unexpectedError: false,
                translated: {},
                settings: {},
                devices: [],
                keepawake: false,
                autoboot: false,
                akey: '',
                token: ''
            };
        },
        watch: {
            'settings.lng': 'setLng'
        },
        methods: {
            setLng() {
                storage.setValue('lng', this.settings.lng);
                this.translated = translation.translatePage();
                eventBus.$emit('settings_languageChanged');
            },
            saveSettings() {
                var self = this;

                self.unexpectedError = self.saved = false;

                self.$http.put(RESTURL + 'settings', {
                    akey: self.akey,
                    token: self.token,
                    settings: self.settings
                }).then(response => {
                    storage.setValue('settings', self.settings);
                    self.showSidebar = self.saved = true;
                }, err => self.showSidebar = self.unexpectedError = true);
            },
            listDevices() {
                var self = this;

                bluetoothSerial.enable(enabled => {
                    bluetoothSerial.list(devices => {
                        self.devices = devices;
                    }, err => console.error(err));
                }, err => console.error(err));
            }
        },
        components: {
            toolbar,
            settings,
            bottomBar
        },
        created() {
            var self = this;

            self.translated = translation.translatePage();
            self.akey = storage.getValue('akey');
            self.token = storage.getValue('token');
            self.settings = storage.getValue('settings', self.settings);
            // wait for cordova device to be ready - apply listener, if not ready yet
            if (self.$root.deviceReady) self.listDevices();
            else eventBus.$on('deviceReady', () => self.listDevices());
            // listener for save
            eventBus.$on('toolbar_saveBtnClicked', () => self.saveSettings());
        }
    }
</script>