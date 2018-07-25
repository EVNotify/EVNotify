<template>
    <md-toolbar class="md-primary">
        <span class="md-title">EVNotify</span>
        <div class="md-toolbar-section-end">
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
    </md-toolbar>
</template>

<script>
export default {
    methods: {
        toggleDebug() {
            this.$emit('debugChanged', (DEBUG = !DEBUG));
        }
    }
}
</script>
