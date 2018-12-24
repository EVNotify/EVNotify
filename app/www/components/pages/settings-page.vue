<template>
    <div>
        <toolbar></toolbar>
        <md-list class="content-within-page" :md-expand-single="true">
            <form class="form inner-form">
                <v-layout row justify-center>
                    <!-- current password dialog -->
                    <v-dialog v-model="passwordDialog" persistent max-width="500px">
                        <v-card>
                            <v-card-title class="headline grey lighten-2">
                                <span class="headline">{{ translated.PASSWORD}}</span>
                            </v-card-title>
                            <v-card-text>
                                <v-container grid-list-md>
                                    {{ translated.PASSWORD_ENTER }}
                                    <v-layout wrap>
                                        <v-flex xs12 sm6 md4>
                                            <v-text-field :label="translated.PASSWORD" required type="password" v-model="password"></v-text-field>
                                            <p class="field-error-message" v-if="invalidPassword">{{ translated.INVALID_CREDENTIALS }}</p>
                                        </v-flex>
                                    </v-layout>
                                </v-container>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="blue darken-1" flat @click.native="passwordDialog = invalidPassword = false; password =''">{{ translated.CANCEL }}</v-btn>
                                <v-btn color="blue darken-1" flat @click.native="verifyPassword()" :disabled="password.length < 6">{{ translated.NEXT }}</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                    <!-- Token reset dialog -->
                    <v-dialog v-model="tokenResetDialog" persistent max-width="500px">
                        <v-card>
                            <v-card-title class="headline grey lighten-2">
                                <span class="headline">{{ translated.TOKEN_RESET}}</span>
                            </v-card-title>
                            <v-card-text>{{ translated.TOKEN_RESET_WARNING }}</v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="blue darken-1" flat @click.native="tokenResetDialog = false; password =''">{{ translated.CANCEL }}</v-btn>
                                <v-btn color="blue darken-1" flat @click.native="tokenResetDialog = false; resetToken()">{{ translated.NEXT }}</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                    <!-- password change dialog -->
                    <v-dialog v-model="passwordChangeDialog" persistent max-width="500px">
                        <v-card>
                            <v-card-title class="headline grey lighten-2">
                                <span class="headline">{{ translated.PASSWORD}}</span>
                            </v-card-title>
                            <v-card-text>
                                <v-container grid-list-md>
                                    {{ translated.PASSWORD_NEW }}
                                    <v-layout wrap>
                                        <v-flex xs12 sm6 md4>
                                            <v-text-field :label="translated.PASSWORD" required type="password" v-model="newPassword"></v-text-field>
                                            <p class="field-error-message" v-if="newPassword.length && newPassword.length < 6">{{ translated.CHECK_PASSWORD }}</p>
                                        </v-flex>
                                        <v-flex xs12 sm6 md4>
                                            <v-text-field :label="translated.PASSWORD_REPEAT" required type="password" v-model="newPassword2"></v-text-field>
                                            <p class="field-error-message" v-if="newPassword2.length && newPassword2 !== newPassword">{{ translated.PASSWORD_MISMATCH }}</p>
                                        </v-flex>
                                    </v-layout>
                                </v-container>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="blue darken-1" flat @click.native="passwordChangeDialog = false; password = newPassword = newPassword2 = ''">{{ translated.CANCEL }}</v-btn>
                                <v-btn color="blue darken-1" flat @click.native="passwordChangeDialog = false; changePassword()" :disabled="newPassword2 !== newPassword || newPassword.length < 6">{{ translated.NEXT }}</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                    <!-- Telegram reset dialog -->
                    <v-dialog v-model="telegramDialog" persistent max-width="500px">
                        <v-card>
                            <v-card-title class="headline grey lighten-2">
                                <span class="headline">{{ translated.TELEGRAM_LINKING}}</span>
                            </v-card-title>
                            <v-card-text>{{ translated.TELEGRAM_LINKING_TEXT }}</v-card-text>
                            <md-field>
                                <label for="token">Token</label>
                                <md-input v-model="token" disabled type="password"></md-input>
                            </md-field>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="blue darken-1" flat @click.native="telegramDialog = false">{{ translated.CANCEL }}</v-btn>
                                <v-btn color="blue darken-1" flat @click.native="telegramDialog = false; openTelegramBot()">{{ translated.NEXT }}</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                    <!-- QR Delete Modal -->
                    <md-dialog-confirm
                        :md-active.sync="deleteQRDialog"
                        :md-title="translated.DELETE_QR"
                        :md-content="translated.DELETE_QR_TEXT"
                        :md-confirm-text="translated.DELETE"
                        :md-cancel-text="translated.CANCEL"
                        @md-cancel="deleteQRDialog = false"
                        @md-confirm="deleteQRDialog = false; deleteQR();"
                    />
                    <!-- QR Send Modal -->
                    <md-dialog-prompt
                        :md-active.sync="sendQRDialog"
                        v-model="qrMail"
                        :md-title="translated.DOWNLOAD_QR"
                        :md-content="translated.DOWNLOAD_QR_TEXT"
                        :md-confirm-text="translated.SEND"
                        :md-cancel-text="translated.CANCEL"
                        @md-cancel="sendQRDialog = false; qrMail=''"
                        @md-confirm="sendQRDialog = false; sendQR();"
                    />
                </v-layout>
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
                        <div class="md-layout">
                            <div class="md-layout-item">
                                <md-button class="md-accent" style="width: 95%" @click="nextDialog = 'password'; passwordDialog = true">{{
                                    translated.PASSWORD_CHANGE }}</md-button>
                            </div>
                            <div class="md-layout-item">
                                <md-button class="md-accent" style="width: 95%" @click="nextDialog = 'token'; passwordDialog = true">{{
                                    translated.TOKEN_RESET }}</md-button>
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
                                <md-option value="IONIQ_HEV">{{ translated.IONIQ_HEV }}</md-option>
                                <md-option value="IONIQ_PHEV">{{ translated.IONIQ_PHEV }}</md-option>
                                <md-option value="SOUL_EV">{{ translated.SOUL_EV }}</md-option>
                                <md-option value="AMPERA_E">{{ translated.AMPERA_E }}</md-option>
                                <md-option value="KONA_EV">{{ translated.KONA_EV }}</md-option>
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
                        <a href="#" @click="showBluetoothSettings()">{{ translated.OBD2_DEVICE_PAIR }}</a>
                    </md-list>
                </md-list-item>
                <md-list-item>
                    <md-icon md-src="icons/location_on.svg"></md-icon>
                    <span class="md-list-item-text">{{ translated.BLUETOOTH_AUTO_ENABLE }}</span>
                    <md-switch v-model="autobluetooth"></md-switch>
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
                            <md-icon md-src="icons/mail.svg"></md-icon>
                            <label for="email">{{ translated.EMAIL }}</label>
                            <md-input v-model="settings.email" type="email" placeholder="mail@example.com"></md-input>
                        </md-field>
                        <md-list-item>
                            <md-icon md-src="icons/notifications_active.svg"></md-icon>
                            <span class="md-list-item">{{ translated.PUSH }}</span>
                            <md-switch v-model="settings.push"></md-switch>
                        </md-list-item>
                        <md-list-item>
                            <md-icon md-src="icons/message.svg"></md-icon>
                            <span class="md-list-item telegram-linking-text" @click="telegramDialog = true">{{ translated.TELEGRAM_LINKING }}</span>
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
                <md-list-item md-expand>
                    <md-icon md-src="icons/linked_camera.svg"></md-icon>
                    <span class="md-list-item-text">QRNotify</span>
                    <md-list slot="md-expand">
                        <span class="md-body-2" style="white-space: initial; text-align: justify">{{ translated.INFO_QR }}</span>
                        <hr>
                        <md-button class="md-raised md-primary" v-if="!qr" @click="createQR()">{{ translated.GENERATE_QR }}</md-button>
                        <canvas id="qr" ref="qr" style="margin: auto"></canvas>
                        <md-button class="md-raised md-primary" v-if="qr" @click="sendQRDialog = true">{{ translated.DOWNLOAD_QR }}</md-button><br>
                        <md-button class="md-raised md-accent" v-if="qr" @click="deleteQRDialog = true">{{ translated.DELETE_QR }}</md-button>
                    </md-list>
                </md-list-item>
                <p class="version" @click="countDevClick()">v.{{ version }}</p>
            </form>
        </md-list>
        <snackbar ref="snackbar"></snackbar>
        <bottom-bar></bottom-bar>
    </div>
</template>

<script>
    import http from './../modules/http.vue';
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
                autobluetooth: true,
                akey: '',
                token: '',
                qr: false,
                passwordDialog: false,
                invalidPassword: false,
                password: '',
                newPassword: '',
                newPassword2: '',
                tokenResetDialog: false,
                passwordChangeDialog: false,
                telegramDialog: false,
                deleteQRDialog: false,
                sendQRDialog: false,
                qrMail: '',
                nextDialog: '',
                devClick: 0,
                version: window.VERSION
            };
        },
        watch: {
            'settings.lng': 'setLng',
            'locationsync': 'setLocationSync',
            'keepawake': 'setKeepAwake',
            'autoboot': 'setAutoBoot',
            'autobluetooth': 'setAutoBluetooth',
            'settings.push': 'setPush'
        },
        methods: {
            setLng() {
                storage.setValue('lng', this.settings.lng);
                this.translated = translation.translatePage();
                eventBus.$emit('settings_languageChanged');
            },
            openTelegramBot() {
                var a = document.createElement("a");
                
                a.target = "_blank";
                a.href = 'https://t.me/evnotify2bot';
                a.click();
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
                this.settings.push = (this.settings.push == true);
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
            setAutoBluetooth() {
                storage.setValue('autobluetooth', this.autobluetooth);
            },
            saveSettings() {
                var self = this;

                // save and store settings
                http.sendRequest('PUT', 'settings', {
                    akey: self.akey,
                    token: self.token,
                    settings: self.settings
                }, true, err => {
                    if (!err) {
                        storage.setValue('settings', self.settings);
                        self.$refs.snackbar.setMessage('SETTINGS_SAVED', false, 'success');
                    } else self.$refs.snackbar.setMessage('UNEXPECTED_ERROR', false, 'error');
                });
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

                // reset token and store new generated token
                http.sendRequest('PUT', 'renewtoken', {
                    akey: self.akey,
                    token: self.token,
                    password: self.password
                }, true, (err, res) => {
                    if (!err && res && res.token) {
                        // subscribe to new token and unsubsribe from previous one
                        if (window.cordova && window.FCMPlugin) FCMPlugin.unsubscribeFromTopic(storage.getValue('token'));
                        storage.setValue('token', (self.token = res.token));
                        if (window.cordova && window.FCMPlugin) FCMPlugin.subscribeToTopic(storage.getValue('token'));
                        self.$refs.snackbar.setMessage('TOKEN_RESETTED', false, 'success');
                    } else self.$refs.snackbar.setMessage(((err && err.status === 401) ? 'INVALID_CREDENTIALS' : 'UNEXPECTED_ERROR'), false, 'error');
                });
                self.password = '';
            },
            verifyPassword() {
                var self = this;

                // send login request to validate if password is valid
                http.sendRequest('POST', 'login', {
                    akey: self.akey,
                    password: self.password
                }, true, err => {
                    if (!err) {
                        self.passwordDialog = self.invalidPassword = false;
                        if (self.nextDialog === 'token') self.tokenResetDialog = true;
                        else self.passwordChangeDialog = true;
                    } else self.invalidPassword = true;
                });
            },
            changePassword() {
                var self = this;

                // send password change request
                http.sendRequest('POST', 'changepw', {
                    akey: self.akey,
                    token: self.token,
                    oldpassword: self.password,
                    newpassword: self.newPassword
                }, true, err => {
                    if (!err) self.$refs.snackbar.setMessage('PASSWORD_CHANGED', false, 'success');
                    else self.$refs.snackbar.setMessage(((err && err.status === 401) ? 'INVALID_CREDENTIALS' : 'UNEXPECTED_ERROR'), false, 'error');                    
                });
                self.password = self.newPassword = self.newPassword2 = '';
            },
            logout() {
                storage.removeValue('akey');
                storage.removeValue('token');
                this.$router.push('/');
            },
            countDevClick() {
                var self = this;

                if (!self.devClick++) {
                    setTimeout(() => {
                        self.devClick = 0;
                    }, 2000);
                }
                if (self.devClick === 5) self.$router.push('/debugsettings');
            },
            showBluetoothSettings() {
                if (typeof bluetoothSerial !== 'undefined') bluetoothSerial.showBluetoothSettings();
            },
            createQR() {
                var self = this;

                http.sendRequest('PUT', 'qr', {
                    akey: self.akey,
                    token: self.token
                }, true, (err, code) => {
                    if (!err && code) {
                        self.qr = storage.setValue('qr', true);
                        QRCode.toCanvas(self.$refs.qr, 'https://qr.evnotify.de?code=' + code, {
                            errorCorrectionLevel: 'H'
                        });
                    }
                });
            },
            sendQR() {
                var self = this;

                http.sendRequest('POST', 'sendqr', {
                    akey: self.akey,
                    token: self.token,
                    email: self.qrMail
                }, true, err => {
                    self.qrMail = '';
                });
            },
            deleteQR() {
                var self = this;

                http.sendRequest('DELETE', 'qr', {
                    akey: self.akey,
                    token: self.token
                }, true, err => {
                    if (!err) {
                        self.qr = storage.setValue('qr', false);
                        // clear qr code
                        self.$refs.qr.getContext('2d').clearRect(0, 0, self.$refs.qr.width, self.$refs.qr.height);
                    }
                });
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
            self.qr = storage.getValue('qr');
            self.settings = storage.getValue('settings', self.settings);
            self.autoboot = storage.getValue('autoboot');
            self.keepawake = storage.getValue('keepawake');
            self.locationsync = storage.getValue('locationsync');
            self.autobluetooth = storage.getValue('autobluetooth', true);
            // wait for cordova device to be ready - apply listener, if not ready yet
            eventBus.$off('deviceReady');
            if (self.$root.deviceReady) self.listDevices();
            else eventBus.$on('deviceReady', () => self.listDevices());
            // listener for save
            eventBus.$off('settings_save');
            eventBus.$on('settings_save', () => self.saveSettings());
            // retrieve settings from server to sync latest settings
            http.sendRequest('GET', 'settings', {
                akey: self.akey,
                token: self.token
            }, true, (err, res) => {
                if (!err && res && res.settings != null) {
                    self.settings = storage.setValue('settings', res.settings);
                }
            });
        },
        mounted() {
            if (this.qr) this.createQR();
        }
    }
</script>

<style scoped>
    .version {
        text-align: right;
        font-style: italic;
        color: grey;
    }
    .field-error-message {
        color: red;
        font-weight: bold;
    }
    .telegram-linking-text {
        color: #4589fc;
        text-decoration: underline;
    }
</style>