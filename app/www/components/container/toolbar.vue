<template>
    <md-toolbar class="md-primary">
        <span class="md-title">EVNotify</span>
        <div class="md-toolbar-section-end" v-if="dashboardPage">
            <md-button class="md-icon-button" v-if="inStandbyMode" @click="disableStandbyMode()">
                <img src="icons/white/power_off.svg" />
            </md-button>
            <md-button class="md-icon-button" :disabled="!forceSyncModes" @click="switchSyncMode()">
                <img :src="syncModeIcon" />
            </md-button>
            <md-button class="md-icon-button" :disabled="true">
                <img :src="bluetoothIcon" />
            </md-button>
            <md-button class="md-icon-button" :disabled="true">
                <img :src="syncIcon" />
            </md-button>
            <md-button class="md-icon-button" @click="toggleDebug()">
                <img src="icons/white/bug_report.svg" />
            </md-button>
        </div>
        <div class="md-toolbar-section-end" v-if="settingsPage || logPage || debugSettingsPage">
            <md-button class="md-icon-button" @click="emitSave()">
                <img src="icons/white/save.svg" />
            </md-button>
        </div>
        <div class="md-toolbar-section-end" v-if="stationPage">
            <md-button class="md-icon-button">
                <img src="icons/white/favorite_border.svg" />
            </md-button>
            <md-button class="md-icon-button" @click="openInNew()">
                <img src="icons/white/open_in_new.svg" />
            </md-button>
            <md-button class="md-icon-button" @click="navigate()">
                <img src='icons/white/directions.svg' />
            </md-button>
        </div>
    </md-toolbar>
</template>

<script>
import eventBus from './../modules/event.vue';
import storage from './../modules/storage.vue';

export default {
    data() {
        return {
            dashboardPage: false,
            settingsPage: false,
            debugSettingsPage: false,
            stationPage: false,
            logPage: false,
            forceSyncModes: false,
            inStandbyMode: false,
            bluetoothIcon: 'icons/white/bluetooth_disabled.svg',
            syncIcon: 'icons/white/sync_disabled.svg',
            syncModeIcon: 'icons/white/cloud_off.svg'
        };
    },
    methods: {
        toggleDebug() {
            this.$emit('debugChanged', (DEBUG = !DEBUG));
        },
        openInNew() {
            eventBus.$emit('station_openInNew');
        },
        navigate() {
            eventBus.$emit('station_navigate');
        },
        emitSave() {
            if (this.settingsPage) eventBus.$emit('settings_save');
            else if (this.logPage) eventBus.$emit('log_save');
            else if (this.debugSettingsPage) eventBus.$emit('debugsettings_save');
        },
        switchSyncMode() {
            if (this.syncModeIcon.indexOf('upload') !== -1) {
                this.syncModeIcon = 'icons/white/cloud_download.svg';
                eventBus.$emit('forcedSyncMode', storage.setValue('lstSyncMode', 'download'));
            } else {
                this.syncModeIcon = 'icons/white/cloud_upload.svg';
                eventBus.$emit('forcedSyncMode', storage.setValue('lstSyncMode', 'upload'));
            }
        },
        disableStandbyMode() {
            this.inStandbyMode = false;
            eventBus.$emit('wakeup');
        }
    },
    created() {
        var self = this,
            currentPage = this.$route.path;

        // determine current page
        self.dashboardPage = (currentPage === '/dashboard');
        self.settingsPage = (currentPage === '/settings');
        self.debugSettingsPage = (currentPage === '/debugsettings');
        self.stationPage = (currentPage === '/station');
        self.logPage = (currentPage === '/log');
        // check if force sync modes enabled
        self.forceSyncModes = storage.getValue('debugSettings', {}).forceSyncModes;
        // listener to dynamically change icons
        eventBus.$off('bluetoothChanged');
        eventBus.$off('syncChanged');
        eventBus.$off('syncModeChanged');
        eventBus.$off('standby');
        eventBus.$on('bluetoothChanged', state => self.bluetoothIcon = 'icons/white/bluetooth_' + state + '.svg');
        eventBus.$on('syncChanged', state => self.syncIcon = 'icons/white/sync_' + state + '.svg');
        eventBus.$on('syncModeChanged', state => self.syncModeIcon = 'icons/white/cloud_' + state + '.svg');
        eventBus.$on('standby', () => self.inStandbyMode = true);
    }
}
</script>
