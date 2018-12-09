<template>
    <md-toolbar class="md-primary">
        <span class="md-title">EVNotify</span>
        <div class="md-toolbar-section-end" v-if="dashboardPage">
            <md-button class="md-icon-button" v-if="inStandbyMode" @click="disableStandbyMode()">
                <md-icon md-src="icons/power_off.svg"></md-icon>
            </md-button>
            <md-button class="md-icon-button" :disabled="!forceSyncModes" @click="switchSyncMode()">
                <md-icon :md-src="syncModeIcon"></md-icon>
            </md-button>
            <md-button class="md-icon-button" :disabled="true">
                <md-icon :md-src="bluetoothIcon"></md-icon>
            </md-button>
            <md-button class="md-icon-button" :disabled="true">
                <md-icon :md-src="syncIcon"></md-icon>
            </md-button>
            <md-button class="md-icon-button" @click="toggleDebug()">
                <md-icon md-src="icons/bug_report.svg"></md-icon>
            </md-button>
        </div>
        <div class="md-toolbar-section-end" v-if="settingsPage || logPage || debugSettingsPage">
            <md-button class="md-icon-button" @click="emitSave()">
                <md-icon md-src="icons/save.svg"></md-icon>
            </md-button>
        </div>
        <div class="md-toolbar-section-end" v-if="stationPage">
            <md-button class="md-icon-button">
                <md-icon md-src="icons/favorite_border.svg"></md-icon>
            </md-button>
            <md-button class="md-icon-button" @click="openInNew()">
                <md-icon md-src="icons/open_in_new.svg"></md-icon>
            </md-button>
            <md-button class="md-icon-button" @click="navigate()">
                <md-icon md-src="icons/directions.svg"></md-icon>
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
            bluetoothIcon: 'icons/bluetooth_disabled.svg',
            syncIcon: 'icons/sync_disabled.svg',
            syncModeIcon: 'icons/cloud_off.svg'
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
                this.syncModeIcon = 'icons/cloud_download.svg';
                eventBus.$emit('forcedSyncMode', storage.setValue('lstSyncMode', 'download'));
            } else {
                this.syncModeIcon = 'icons/cloud_upload.svg';
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
        eventBus.$on('bluetoothChanged', state => self.bluetoothIcon = 'icons/bluetooth_' + state + '.svg');
        eventBus.$on('syncChanged', state => self.syncIcon = 'icons/sync_' + state + '.svg');
        eventBus.$on('syncModeChanged', state => self.syncModeIcon = 'icons/cloud_' + state + '.svg');
        eventBus.$on('standby', () => self.inStandbyMode = true);
    }
}
</script>
