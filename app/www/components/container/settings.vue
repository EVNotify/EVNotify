<template>
    <div>
        <form class="form">
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
            <md-subheader class="md-primary">
                <b>{{ translated.NOTIFICATIONS }}</b>
            </md-subheader>
            <md-divider></md-divider>
            <md-field>
                <label for="soc">{{ translated.SOC_THRESHOLD }}</label>
                <input v-model.number="settings.soc" type="range">{{ settings.soc }}%
            </md-field>
        </form>
        <md-button class="md-raised md-primary" @click="$emit('settingsSaved', settings)">{{ translated.SAVE }}</md-button>
    </div>
</template>

<script>
    import translation from './../modules/translation.vue';
    import storage from './../modules/storage.vue';

    export default {
        data() {
            return {
                translated: {},
                settings: {
                    soc: 70
                },
                devices: []
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
            },
            translatePage() {
                this.translated = translation.translatePage();
            }
        },
        created() {
            this.translatePage();
        }
    }
</script>