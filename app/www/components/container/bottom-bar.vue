<template>
    <md-bottom-bar md-type="shift" :md-active-item.sync="currentSelection">
        <md-bottom-bar-item id="bottom-bar-item-dashboard" md-label="Dashboard" md-icon="dashboard" to="/dashboard"></md-bottom-bar-item>
        <md-bottom-bar-item id="bottom-bar-item-logs" md-label="Logs" md-icon="list" to="/logs"></md-bottom-bar-item>
        <md-bottom-bar-item id="bottom-bar-item-stations" md-label="Stations" md-icon="ev_station" to="/stations"></md-bottom-bar-item>
        <md-bottom-bar-item id="bottom-bar-item-settings" md-label="Settings" md-icon="settings" to="/settings"></md-bottom-bar-item>
    </md-bottom-bar>
</template>

<script>
export default {
    data() {
        return {
            currentSelection: 'dashboard'
        };
    },
    created() {
        this.currentSelection = 'bottom-bar-item-' + this.$route.path.substr(1);
    }
}
</script>

