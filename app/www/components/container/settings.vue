<template>
    <div>
        <form class="form">
            <md-subheader>{{ translated.USER }}</md-subheader>
            <md-divider></md-divider>
            <md-field>
                <label for="lng">{{ translated.LANGUAGE }}</label>
                <md-select v-model="settings.lng">
                    <md-option value="de">{{ translated.GERMAN }}</md-option>
                    <md-option value="en">{{ translated.ENGLISH }}</md-option>
                </md-select>
            </md-field>
            <md-subheader>{{ translated.CAR }}</md-subheader>
            <md-field>
                <label>Name</label>
                <md-input v-model="settings.name"></md-input>
            </md-field>
            <md-divider></md-divider>
            <md-subheader>{{ translated.DEVICE }}</md-subheader>
            <md-divider></md-divider>
            <md-subheader>{{ translated.NOTIFICATIONS }}</md-subheader>
            <md-divider></md-divider>
        </form>
        <md-button class="md-raised md-primary" @click="$emit('savedSettings', settings)">{{ translated.SAVE }}</md-button>
    </div>
</template>

<script>
    import translation from './../modules/translation.vue';

    export default {
        data() {
            return {
                translated: {},
                settings: {}
            };
        },
        components: {
            translation
        },
        watch: {
            'settings.lng': 'test'
        },
        methods: {
            test() {
                console.log(this);
            }
        },
        created() {
            var self = this,
                toTranslate = [
                    'USER', 'CAR', 'DEVICE', 'NOTIFICATIONS',
                    'LANGUAGE', 'GERMAN', 'ENGLISH', 'SAVE'
                ];

            // translate all labels in correct language
            toTranslate.forEach(key => self.translated[key] = translation.translate(key));
        }
    }
</script>