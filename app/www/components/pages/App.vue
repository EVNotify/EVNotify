<!-- App container for Vue.js -->
<template>
    <div id="app">
        <div class="loading-overlay" v-if="$root.loading">
            <md-progress-spinner md-mode="indeterminate" :md-stroke="2"></md-progress-spinner>
        </div>
        <transition name="fade">
            <router-view></router-view>
        </transition>
        <md-dialog-alert :md-active.sync="$root.updateAvailable" :md-title="updateTitle" :md-content="updateText" />
    </div>
</template>

<script>
    import eventBus from './../modules/event.vue';
    import translation from './../modules/translation.vue';

    export default {
        data() {
            return {
                updateTitle: translation.translate('UPDATE_AVAILABLE_TITLE'),
                updateText: translation.translate('UPDATE_AVAILABLE_TEXT')
            };
        }
    }
</script>