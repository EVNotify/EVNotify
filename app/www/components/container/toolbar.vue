<template>
    <md-toolbar class="md-primary">
        <span class="md-title">EVNotify</span>
        <div class="md-toolbar-section-end" v-if="dashboardPage">
            <md-button class="md-icon-button" :disabled="true">
                <md-icon>bluetooth_disabled</md-icon>
            </md-button>
            <md-button class="md-icon-button" :disabled="true">
                <md-icon>sync_problem</md-icon>
            </md-button>
            <md-button class="md-icon-button" @click="toggleDebug()">
                <md-icon>bug_report</md-icon>
            </md-button>
        </div>
        <div class="md-toolbar-section-end" v-if="settingsPage">
            <md-button class="md-icon-button">
                <md-icon>account_circle</md-icon>
            </md-button>
            <md-button class="md-icon-button" @click="emitSave()">
                <md-icon>save</md-icon>
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
            settingsPage: false
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
        var currentPage = this.$route.path;

        this.dashboardPage = (currentPage === '/dashboard');
        this.settingsPage = (currentPage === '/settings');
    }
}
</script>
