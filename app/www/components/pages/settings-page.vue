<template>
    <div>
        <toolbar></toolbar>
        <settings @settingsSaved="saveSettings($event)"></settings>
        <md-snackbar md-position="center" :md-duration="4000" :md-active.sync="showSidebar">
            <span v-if="saved">{{ translated.SETTINGS_SAVED }}</span>
            <span v-if="unexpectedError">{{ translated.UNEXPECTED_ERROR }}</span>
        </md-snackbar>
        <bottom-bar></bottom-bar>
    </div>
</template>

<script>
    import storage from './../modules/storage.vue';
    import translation from './../modules/translation.vue';
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
                settings: {}
            };
        },
        methods: {
            saveSettings(settings) {
                var self = this;
                
                self.unexpectedError = self.saved = false;

                self.$http.put(RESTURL + 'settings', {
                    akey: storage.getValue('akey'),
                    token: storage.getValue('token'),
                    settings
                }).then(response => {
                    storage.setValue('settings', settings);
                    self.showSidebar = self.saved = true;
                }, err => self.showSidebar = self.unexpectedError = true);
            }
        },
        components: {
            toolbar,
            settings,
            bottomBar
        },
        created() {
            this.translated = translation.translatePage();
        }
    }
</script>