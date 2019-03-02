<template>
    <div>
        <toolbar></toolbar>
        <md-list class="content-within-page" :md-expand-single="true">
            <form class="form inner-form">
                <p class="debug-settings-warning">{{ translated.DEBUG_SETTINGS_WARNING }}</p>
                <md-subheader>{{ translated.CONNECTION }}</md-subheader>
                <md-field>
                    <label for="resturl">RESTURL</label>
                    <md-input v-model="debug.resturl"></md-input>
                </md-field>
                <md-subheader>{{ translated.DEVICE }}</md-subheader>
                <md-list-item>
                    <img src="icons/cloud.svg" />
                    <span class="md-list-item-text">{{ translated.FORCE_SYNC_MODES }}</span>
                    <md-switch v-model="debug.forceSyncModes"></md-switch>
                </md-list-item>
                <md-list-item>
                    <span class="md-list-item-text">PERSISTENT_NOTIFICATION</span>
                    <md-switch v-model="debug.persistentNotification"></md-switch>
                </md-list-item>
                <md-list-item>
                    <span class="md-list-item-text">REALTIME_SYNC</span>
                    <md-switch v-model="debug.realtimeSync"></md-switch>
                </md-list-item>
                <md-list-item>
                    <span class="md-list-item-text">AUTO_WAKEUP</span>
                    <md-switch v-model="debug.autoWakeup"></md-switch>
                </md-list-item>
                <md-list-item>
                    <span class="md-list-item-text">PAUSE_LOCATION_SYNC_ON_CHARGE</span>
                    <md-switch v-model="debug.pauseLocationSyncOnCharge"></md-switch>
                </md-list-item>
                <md-list-item>
                    <span class="md-list-item-text">SEXY_DASHBOARD</span>
                    <md-switch v-model="debug.sexyDashboard"></md-switch>
                </md-list-item>
                <md-list-item>
                    <span class="md-list-item-text">ML_PREDICTIONS</span>
                    <md-switch v-model="debug.mlPredictions"></md-switch>
                </md-list-item>
                <md-list-item>
                    <span class="md-list-item-text">STATIONS_NOTIFICATIONS</span>
                    <md-switch v-model="debug.stationsNotifications"></md-switch>
                </md-list-item>
                <md-list-item>
                    <span class="md-list-item-text">STATIONS_CHECKIN</span>
                    <md-switch v-model="debug.stationsCheckIn"></md-switch>
                </md-list-item>
            </form>
        </md-list>
        <snackbar ref="snackbar"></snackbar>
        <bottom-bar></bottom-bar>
    </div>
</template>

<script>
    import translation from './../modules/translation.vue';
    import eventBus from './../modules/event.vue';
    import storage from './../modules/storage.vue';
    import toolbar from './../container/toolbar.vue';
    import snackbar from './../modules/snackbar.vue';
    import bottomBar from './../container/bottom-bar.vue';

    export default {
        data() {
            return {
                translated: {},
                debug: {}
            }
        },
        components: {
            toolbar,
            snackbar,
            bottomBar
        },
        created() {
            var self = this;

            self.translated = translation.translatePage();
            self.debug = storage.getValue('debugSettings', {});
            if (!self.debug.resturl) self.debug.resturl = RESTURL; // original RESTURL as default
            if (typeof Rollbar !== 'undefined') {
                // if url changed, disable tracking to prevent errors being reported
                Rollbar.configure({
                    enabled: self.debug.resturl === RESTURL
                });
            }
            // listener for save
            eventBus.$off('debugsettings_save');
            eventBus.$on('debugsettings_save', () => {
                storage.setValue('debugSettings', self.debug);
                eventBus.$emit('resturlChanged');
                self.$refs.snackbar.setMessage('SETTINGS_SAVED', false, 'success');
            });
        },
        mounted() {
            this.$refs.snackbar.setMessage('DEBUG_SETTINGS_WELCOME', false);
        }
    }
</script>

<style scoped>
.debug-settings-warning {
    text-align: justify;
    margin: 16px;
}
</style>
