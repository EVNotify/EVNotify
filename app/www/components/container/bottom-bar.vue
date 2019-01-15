<template>
    <md-bottom-bar md-type="shift" :md-active-item.sync="currentSelection">
        <md-bottom-bar-item id="bottom-bar-item-dashboard" :md-label="translated.DASHBOARD" to="/dashboard">
            <img src="icons/white/dashboard.svg" />
            <span class="md-bottom-bar-label">{{ translated.DASHBOARD }}</span>
        </md-bottom-bar-item>
        <md-bottom-bar-item id="bottom-bar-item-logs" :md-label="translated.LOGS" to="/logs">
            <img src="icons/white/list.svg" />
            <span class="md-bottom-bar-label">{{ translated.LOGS }}</span>
        </md-bottom-bar-item>
        <md-bottom-bar-item id="bottom-bar-item-stations" :md-label="translated.STATIONS" to="/stations">
            <img src="icons/white/ev_station.svg" />
            <span class="md-bottom-bar-label">{{ translated.STATIONS }}</span>
        </md-bottom-bar-item>
        <md-bottom-bar-item id="bottom-bar-item-settings" :md-label="translated.SETTINGS" to="/settings">
            <img src="icons/white/settings.svg" />
            <span class="md-bottom-bar-label">{{ translated.SETTINGS }}</span>
        </md-bottom-bar-item>
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

            eventBus.$off('settings_languageChanged');
            eventBus.$on('settings_languageChanged', function() {
                self.translatePage();
            });
            self.currentSelection = 'bottom-bar-item-' + self.$route.path.substr(1);
            if (self.currentSelection === 'bottom-bar-item-station') self.currentSelection = 'bottom-bar-item-stations';
            else if (self.currentSelection === 'bottom-bar-item-log') self.currentSelection = 'bottom-bar-item-logs';
            else if (self.currentSelection === 'bottom-bar-item-debugsettings') self.currentSelection = 'bottom-bar-item-settings';
            self.translatePage();
        }
    }
</script>
