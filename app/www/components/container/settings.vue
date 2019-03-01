<template>
    <div class="content-within-page">
        <form class="form inner-form">
            <md-subheader class="md-primary">
                <b>{{ translated.USER }}</b>
            </md-subheader>
            <md-divider></md-divider>
            <md-field>
                <label for="lng">{{ translated.LANGUAGE }}</label>
                <md-select v-model="settings.lng" required>
                    <md-option value="de">{{ translated.GERMAN }}</md-option>
                    <md-option value="en">{{ translated.ENGLISH }}</md-option>
                </md-select>
            </md-field>
            <md-subheader class="md-primary">
                <b>{{ translated.CAR }}</b>
            </md-subheader>
            <md-divider></md-divider>
            <md-field>
                <label for="car">{{ translated.CAR }}</label>
                <md-select v-model="settings.car" required @md-selected="showCarMessage()">
                    <md-option value="IONIQ_BEV">{{ translated.IONIQ_BEV }}</md-option>
                    <md-option value="IONIQ_HEV">{{ translated.IONIQ_HEV }}</md-option>
                    <md-option value="IONIQ_PHEV">{{ translated.IONIQ_PHEV }}</md-option>
                    <md-option value="SOUL_EV">{{ translated.SOUL_EV }}</md-option>
                    <md-option value="AMPERA_E">{{ translated.AMPERA_E }}</md-option>
                    <md-option value="KONA_EV">{{ translated.KONA_EV }}</md-option>
                    <md-option value="ZOE_Q210">{{ translated.ZOE_Q210 }}</md-option>
                </md-select>
                <span class="input-field-error">{{ carMessage }}</span>
            </md-field>
            <md-field>
                <label for="consumption">{{ translated.CONSUMPTION }}</label>
                <md-input v-model="settings.consumption" type="number" placeholder="12.34" required></md-input>
                <span class="md-suffix">kWh/100km</span>
            </md-field>
            <md-subheader class="md-primary">
                <b>{{ translated.DEVICE }}</b>
            </md-subheader>
            <md-divider></md-divider>
            <md-field>
                <label for="devices">{{ translated.OBD2_DEVICE }}</label>
                <md-select v-model="settings.device" required>
                    <md-option v-for="(device, index) in devices" :key="index" :value="device.id">{{ device.name }}</md-option>
                </md-select>
            </md-field>
            <a href="#" @click="showBluetoothSettings()">{{ translated.OBD2_DEVICE_PAIR }}</a>
            <md-subheader class="md-primary">
                <b>{{ translated.NOTIFICATIONS }}</b>
            </md-subheader>
            <md-divider></md-divider>
            <md-field>
                <input v-model.number="settings.soc" type="range" style="width: 100%">{{ settings.soc }}%
                <span class="md-helper-text">{{ translated.SOC_THRESHOLD }}</span>
            </md-field>
            <br>
            <md-field>
                <label for="email">{{ translated.EMAIL }}</label>
                <md-input v-model="settings.email" type="email" placeholder="mail@example.com"></md-input>
            </md-field>
            <md-field>
                <img src="icons/notifications_active.svg" />
            <span>{{ translated.PUSH }}</span>
            <md-switch v-model="settings.push"></md-switch>
            </md-field>
        </form>
        <md-button class="md-raised md-primary" v-if="$route.path === '/register'" @click="$emit('settingsSaved', settings)">{{ translated.SAVE }}</md-button>
    </div>
</template>

<script>
    import translation from './../modules/translation.vue';
    import storage from './../modules/storage.vue';
    import eventBus from './../modules/event.vue';

    export default {
        data() {
            return {
                translated: {},
                settings: {
                    soc: 70,
                    summary: false,
                    lng: translation.getLocalLng()
                },
                carMessage: '',
                devices: [],
                autoboot: false,
                keepawake: false
            };
        },
        components: {
            translation,
            storage
        },
        watch: {
            'settings.lng': 'setLng',
            'settings.push': 'setPush'
        },
        methods: {
            showCarMessage() {
                if (!this.settings.car) return this.carMessage = '';
                switch (this.settings.car) {
                    case 'IONIQ_HEV':
                    case 'IONIQ_PHEV':
                    case 'ZOE_Q210':
                    case 'AMPERA_E':
                        this.carMessage = translation.translate('CAR_BASIS_SUPPORT');
                        break;
                    case 'SOUL_EV':
                    case 'KONA_EV':
                        this.carMessage = translation.translate('CAR_INVALID_SUPPORT');
                        break;
                    default:
                        this.carMessage = '';
                        break;
                }
            },
            setLng() {
                storage.setValue('lng', this.settings.lng);
                this.translatePage();
                this.$emit('languageChanged');
                eventBus.$emit('settings_languageChanged');
            },
            setPush() {
                if (window.cordova && window.FCMPlugin) {
                    if (this.settings.push) FCMPlugin.subscribeToTopic(storage.getValue('token'));
                    else FCMPlugin.unsubscribeFromTopic(storage.getValue('token'));
                }
            },
            translatePage() {
                this.translated = translation.translatePage();
            },
            listDevices() {
                var self = this;

                bluetoothSerial.enable(enabled => {
                    bluetoothSerial.list(devices => {
                        self.devices = devices;
                    }, err => console.error(err));
                }, err => console.error(err));
            },
            showBluetoothSettings() {
                if (typeof bluetoothSerial !== 'undefined') bluetoothSerial.showBluetoothSettings();
            }
        },
        created() {
            var self = this;

            self.translatePage();
            eventBus.$off('deviceReady');
            // wait for cordova device to be ready - apply listener, if not ready yet
            if(self.$root.deviceReady) self.listDevices();
            else {
                eventBus.$on('deviceReady', function() {
                    self.listDevices();
                });
            }
            self.settings = storage.getValue('settings', self.settings);
            // listen for save btn press (only for settings page) to push event
            eventBus.$off('settings_save');
            if (self.$route.path === '/settings') eventBus.$on('settings_save', () => self.$emit('settingsSaved', self.settings));
        }
    }
</script>
