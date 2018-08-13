<template>
    <md-bottom-bar md-type="shift" :md-active-item.sync="currentSelection">
        <md-bottom-bar-item id="bottom-bar-item-dashboard" :md-label="translated.DASHBOARD" md-icon="icons/dashboard.svg" to="/dashboard"></md-bottom-bar-item>
        <md-bottom-bar-item id="bottom-bar-item-logs" :md-label="translated.LOGS" md-icon="icons/list.svg" to="/logs"></md-bottom-bar-item>
        <md-bottom-bar-item id="bottom-bar-item-stations" :md-label="translated.STATIONS" md-icon="icons/ev_station.svg" to="/stations"></md-bottom-bar-item>
        <md-bottom-bar-item id="bottom-bar-item-settings" :md-label="translated.SETTINGS" md-icon="icons/settings.svg" to="/settings"></md-bottom-bar-item>
    </md-bottom-bar>
</template>

<script>
    import translation from './../modules/translation.vue';
    import eventBus from './../modules/event.vue';

    export default {
        data() {
            return {
                currentSelection: 'dashboard',
                translated: {}
            };
        },
        methods: {
            translatePage() {
                this.translated = translation.translatePage();
            }
        },
        created() {
            var self = this;

            eventBus.$on('settings_languageChanged', function() {
                self.translatePage();
            });
            self.currentSelection = 'bottom-bar-item-' + self.$route.path.substr(1);
            self.translatePage();
        }
    }
</script>