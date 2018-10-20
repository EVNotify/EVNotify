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
                <md-list-item>
                    <md-icon md-src="icons/bug_report.svg"></md-icon>
                    <span class="md-list-item-text">{{ translated.ERROR_TRACKING }}</span>
                    <md-switch v-model="errortracking"></md-switch>
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
                        <md-dialog-prompt :md-active.sync="showOldPasswordDialog" v-model="dialogOldPassword" :md-title="translated.PASSWORD"
                            :md-input-placeholder="translated.PASSWORD" :md-content="translated.PASSWORD_ENTER"
                            @md-confirm="showPasswordDialog = true" :md-confirm-text="translated.NEXT" :md-cancel-text="translated.CANCEL" />
                        <md-dialog-prompt :md-active.sync="showPasswordDialog" v-model="dialogPassword" :md-title="translated.PASSWORD"
                            :md-input-placeholder="translated.PASSWORD" :md-content="((nextDialog === 'token')? translated.PASSWORD_ENTER : translated.PASSWORD_NEW)"
                            @md-confirm="((nextDialog === 'token')? showTokenResetDialog = true : changePassword())"
                            :md-confirm-text="translated.NEXT" :md-cancel-text="translated.CANCEL" />
                        <div class="md-layout">
                            <div class="md-layout-item">
                                <md-button class="md-accent" style="width: 95%" @click="nextDialog = 'password'; showOldPasswordDialog = true">{{
                                    translated.PASSWORD_CHANGE }}</md-button>
                            </div>
                            <div class="md-layout-item">
                                <md-button class="md-accent" style="width: 95%" @click="nextDialog = 'token'; showPasswordDialog = true">{{
                                    translated.TOKEN_RESET }}</md-button>
                                <md-dialog-confirm :md-active.sync="showTokenResetDialog" :md-title="translated.TOKEN_RESET"
                                    :md-content="translated.TOKEN_RESET_WARNING" :md-confirm-text="translated.NEXT"
                                    :md-cancel-text="translated.CANCEL" @md-confirm="resetToken" />
                            </div>
                        </div>
                        <div class="md-layout">
                            <div class="md-layout-item">
                                <md-button style="width: 95%" class="md-accent" @click="logout()">{{ translated.LOGOUT
                                    }}</md-button>
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
                                <md-option value="AMPERA_E">{{ translated.AMPERA_E }}</md-option>
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
                <md-subheader>{{ translated.SYNC }}</md-subheader>
                <md-list-item>
                    <md-icon md-src="icons/location_on.svg"></md-icon>
                    <span class="md-list-item-text">{{ translated.SYNC_LOCATION }}</span>
                    <md-switch v-model="locationsync"></md-switch>
                </md-list-item>
                <md-subheader>{{ translated.DEVICES }}</md-subheader>
                <md-list-item md-expand>
                    <md-icon md-src="icons/bluetooth_connected.svg"></md-icon>
                    <span class="md-list-item-text">{{ translated.OBD2_DEVICE }}</span>
                    <md-list slot="md-expand">
                        <md-field>
                            <label for="devices">{{ translated.OBD2_DEVICE }}</label>
                            <md-select v-model="settings.device" required>
                                <md-option v-for="(device, index) in devices" :key="index" :value="device.id">{{
                                    device.name }}</md-option>
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
                        <md-list-item>
                            <md-icon md-src="icons/notifications_active.svg"></md-icon>
                            <span class="md-list-item">{{ translated.PUSH }}</span>
                            <md-switch v-model="settings.push"></md-switch>
                        </md-list-item>
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
                <p class="version">v.{{ version }}</p>
            </form>
        </md-list>
        <snackbar ref="snackbar"></snackbar>
        <bottom-bar></bottom-bar>
    </div>
</template>

<script>
    import storage from './../modules/storage.vue';
    import translation from './../modules/translation.vue';
    import eventBus from './../modules/event.vue';
    import toolbar from './../container/toolbar.vue';
    import snackbar from './../modules/snackbar.vue';
    import settings from './../container/settings.vue';
    import bottomBar from './../container/bottom-bar.vue';

    export default {
        data() {
            return {
                translated: {},
                settings: {},
                devices: [],
                errortracking: false,
                locationsync: false,
                keepawake: false,
                autoboot: false,
                akey: '',
                token: '',
                nextDialog: '',
                dialogOldPassword: '',
                dialogPassword: '',
                showOldPasswordDialog: false,
                showPasswordDialog: false,
                showTokenResetDialog: false,
                version: window.VERSION
            };
        },
        watch: {
            'settings.lng': 'setLng',
            'locationsync': 'setLocationSync',
            'keepawake': 'setKeepAwake',
            'autoboot': 'setAutoBoot',
            'settings.push': 'setPush'
        },
        methods: {
            setLng() {
                storage.setValue('lng', this.settings.lng);
                this.translated = translation.translatePage();
                eventBus.$emit('settings_languageChanged');
            },
            setLocationSync() {
                var self = this,
                    enabled = storage.setValue('locationsync', self.locationsync);

                // check permission access
                if (enabled) {
                    navigator.geolocation.getCurrentPosition(() => {}, () => {
                        self.$refs.snackbar.setMessage('LOCATION_ACCESS_DENIED', false, 'error');
                        self.locationsync = false;
                    });
                }
            },
            setPush() {
                // fix for md-switch accepting only booleans instead of numbers that equal boolean values
                if (this.settings.push) this.settings.push = true;
                else this.settings.push = false;
                if (window.cordova && window.FCMPlugin) {
                    if (this.settings.push) FCMPlugin.subscribeToTopic(this.token);
                    else FCMPlugin.unsubscribeFromTopic(this.token);
                }
            },
            setKeepAwake() {
                storage.setValue('keepawake', this.keepawake);
            },
            setAutoBoot() {
                storage.setValue('autoboot', this.autoboot);
            },
            saveSettings() {
                var self = this;

                self.$http.put(RESTURL + 'settings', {
                    akey: self.akey,
                    token: self.token,
                    settings: self.settings
                }).then(response => {
                    self.$refs.snackbar.setMessage('SETTINGS_SAVED', false, 'success');
                    storage.setValue('settings', self.settings);
                }, err => self.$refs.snackbar.setMessage('UNEXPECTED_ERROR', false, 'error'));
            },
            listDevices() {
                var self = this;

                bluetoothSerial.enable(enabled => {
                    bluetoothSerial.list(devices => {
                        self.devices = devices;
                    }, err => console.log(err));
                }, err => console.log(err));
            },
            resetToken() {
                var self = this;

                self.$http.put(RESTURL + 'renewtoken', {
                    akey: self.akey,
                    token: self.token,
                    password: self.dialogPassword
                }).then(response => {
                    if (response.body.token) {
                        storage.setValue('token', (self.token = response.body.token));
                        self.$refs.snackbar.setMessage('TOKEN_RESETTED', false, 'success');
                    } else self.$refs.snackbar.setMessage('UNEXPECTED_ERROR', false, 'error');
                }, err => {
                    // TODO: Check if credentials were invalid or if there was an unexpected error..
                    self.$refs.snackbar.setMessage('INVALID_CREDENTIALS', false, 'error');
                });
            },
            changePassword() {
                var self = this;

                self.$http.post(RESTURL + 'changepw', {
                    akey: self.akey,
                    token: self.token,
                    oldpassword: self.dialogOldPassword,
                    newpassword: self.dialogPassword
                }).then(response => {
                    self.$refs.snackbar.setMessage('PASSWORD_CHANGED', false, 'success');
                }, err => self.$refs.snackbar.setMessage('UNEXPECTED_ERROR', false, 'error'));
            },
            logout() {
                storage.removeValue('akey');
                storage.removeValue('token');
                this.$router.push('/');
            }
        },
        components: {
            toolbar,
            snackbar,
            settings,
            bottomBar
        },
        created() {
            var self = this;

            self.translated = translation.translatePage();
            self.akey = storage.getValue('akey');
            self.token = storage.getValue('token');
            self.settings = storage.getValue('settings', self.settings);
            self.autoboot = storage.getValue('autoboot');
            self.keepawake = storage.getValue('keepawake');
            self.locationsync = storage.getValue('locationsync');
            // wait for cordova device to be ready - apply listener, if not ready yet
            eventBus.$off('deviceReady');
            if (self.$root.deviceReady) self.listDevices();
            else eventBus.$on('deviceReady', () => self.listDevices());
            // listener for save
            eventBus.$off('settings_save');
            eventBus.$on('settings_save', () => self.saveSettings());
            // retrieve settings from server to sync latest settings
            self.$http.get(RESTURL + 'settings', {
                params: {
                    akey: self.akey,
                    token: self.token
                }
            }).then(response => {
                if (response.body.settings != null) self.settings = storage.setValue('settings', response.body.settings);
            }, err => console.log(err));
        }
    }
</script>

<style scoped>
    .version {
        text-align: right;
        font-style: italic;
        color: grey;
    }
</style>