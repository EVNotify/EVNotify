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
                <md-select v-model="settings.car" required>
                    <md-option value="IONIQ_BEV">{{ translated.IONIQ_BEV }}</md-option>
                    <md-option value="SOUL_EV">{{ translated.SOUL_EV }}</md-option>
                </md-select>
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
                <md-icon md-src="icons/notifications_active.svg"></md-icon>
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
            }
        },
        created() {
            var self = this;

            self.translatePage();
            // wait for cordova device to be ready - apply listener, if not ready yet
            if(self.$root.deviceReady) self.listDevices();
            else {
                eventBus.$once('deviceReady', function() {
                    self.listDevices();
                });
            }
            self.settings = storage.getValue('settings', self.settings);
            // listen for save btn press (only for settings page) to push event
            if (self.$route.path === '/settings') eventBus.$once('settings_save', () => self.$emit('settingsSaved', self.settings));
        }
    }
</script>