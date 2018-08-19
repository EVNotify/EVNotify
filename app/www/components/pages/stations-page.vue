<template>
    <div>
        <toolbar></toolbar>
        <div class="content-within-page">
            <md-tabs class="md-transparent" md-alignment="fixed">
                <md-tab id="tab-list" :md-label="translated.LIST"></md-tab>
                <md-tab id="tab-favorites" :md-label="translated.FAVORITES"></md-tab>
                <md-tab id="tab-map" :md-label="translated.MAP"></md-tab>
            </md-tabs>
            <md-empty-state md-icon="icons/ev_station.svg" :md-label="translated.STATIONS_EMPTY">
                <p class="md-empty-state-description">{{ translated.STATIONS_EMPTY_DESCRIPTION_1 }}
                    <br>{{ translated.STATIONS_EMPTY_DESCRIPTION_2 }}</p>
            </md-empty-state>
        </div>
        <bottom-bar></bottom-bar>
    </div>
</template>

<script>
    import toolbar from './../container/toolbar.vue';
    import translation from './../modules/translation.vue';
    import bottomBar from './../container/bottom-bar.vue';
    export default {
        data() {
            return {
                translated: {}
            };
        },
        methods: {},
        components: {
            toolbar,
            bottomBar
        },
        created() {
            this.translated = translation.translatePage();
        }
    }
</script>