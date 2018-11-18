<!-- App container for Vue.js -->
<template>
    <div id="app">
        <div class="loading-overlay" v-if="$root.loading">
            <md-progress-spinner md-mode="indeterminate" :md-stroke="2"></md-progress-spinner>
        </div>
        <transition name="fade">
            <router-view></router-view>
        </transition>
    </div>
</template>