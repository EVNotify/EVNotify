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
                <md-select v-model="settings.devices" required>
                    <md-option v-for="(device, index) in devices" :key="index" :value="device.id">{{ device.name }}</md-option>
                </md-select>
            </md-field>
            <div>
                <md-switch v-model="autoboot">{{ translated.AUTOBOOT }}</md-switch>
            </div>
            <div>
                <md-switch v-model="keepawake">{{ translated.KEEPAWAKE }}</md-switch>
            </div>
            <md-subheader class="md-primary">
                <b>{{ translated.NOTIFICATIONS }}</b>
            </md-subheader>
            <md-divider></md-divider>
            <md-field>
                <input v-model.number="settings.soc" type="range" style="width: 100%">{{ settings.soc }}%
                <span class="md-helper-text">{{ translated.SOC_THRESHOLD }}</span>
            </md-field>
            <md-field>
                <label for="email">{{ translated.EMAIL }}</label>
                <md-input v-model="settings.email" type="email" placeholder="mail@example.com"></md-input>
            </md-field>
            <div>
                <md-checkbox v-model="settings.summary">{{ translated.SUMMARY }}</md-checkbox>
            </div>
        </form>
        <md-button class="md-raised md-primary" @click="$emit('settingsSaved', settings)">{{ translated.SAVE }}</md-button>
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
                    summary: false
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
            'settings.lng': 'setLng'
        },
        methods: {
            setLng() {
                storage.setValue('lng', this.settings.lng);
                this.translatePage();
                this.$emit('languageChanged');
                eventBus.$emit('settings_languageChanged');
            },
            translatePage() {
                this.translated = translation.translatePage();
            },
            getSettings(useLocalLng) {
                var self = this;
                
                self.$http.get(RESTURL + 'settings', {
                    params: {
                        akey: storage.getValue('akey'),
                        token: storage.getValue('token')
                    }
                }).then(response => {
                    self.settings = response.body.settings || self.settings;
                    
                    if (useLocalLng) self.settings.lng = translation.getLocalLng();
                    
                    storage.setValue('settings', self.settings);
                }, err => console.error(err));
            }
        },
        created() {
            var self = this;

            self.translatePage();
            eventBus.$on('settings_getSettings', function (useLocalLng) {
                self.getSettings(useLocalLng);
            });
            self.settings = storage.getValue('settings', self.settings);
        }
    }
</script>