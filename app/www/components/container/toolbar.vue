<template>
    <md-toolbar class="md-primary">
        <span class="md-title">EVNotify</span>
        <div class="md-toolbar-section-end" v-if="dashboardPage">
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
        <div class="md-toolbar-section-end" v-if="settingsPage">
            <md-button class="md-icon-button">
                <md-icon md-src="icons/account_circle.svg"></md-icon>
            </md-button>
            <md-button class="md-icon-button" @click="emitSave()">
                <md-icon md-src="icons/save.svg"></md-icon>
            </md-button>
        </div>
    </md-toolbar>
</template>

<script>
import eventBus from './../modules/event.vue';

export default {
    data() {
        return {
            dashboardPage: false,
            settingsPage: false,
            bluetoothIcon: 'icons/bluetooth_disabled.svg',
            syncIcon: 'icons/sync_disabled.svg'
        };
    },
    methods: {
        toggleDebug() {
            this.$emit('debugChanged', (DEBUG = !DEBUG));
        },
        emitSave() {
            eventBus.$emit('toolbar_saveBtnClicked');
        }
    },
    created() {
        var self = this,
            currentPage = this.$route.path;

        // determine current page
        self.dashboardPage = (currentPage === '/dashboard');
        self.settingsPage = (currentPage === '/settings');
        // listener to dynamically change icons
        eventBus.$on('bluetoothChanged', state => self.bluetoothIcon = 'icons/bluetooth_' + state + '.svg');
        eventBus.$on('syncChanged', state => self.syncIcon = 'icons/sync_' + state + '.svg');
    }
}
</script>
