<template>
    <div>
        <toolbar></toolbar>
        <div class="content-within-page">
            <md-tabs class="md-transparent" md-alignment="fixed">
                <md-tab id="tab-charges" :md-label="translated.CHARGES"></md-tab>
                <md-tab id="tab-drives" :md-label="translated.DRIVES"></md-tab>
                <md-tab id="tab-statistics" :md-label="translated.STATISTICS"></md-tab>
            </md-tabs>
            <md-empty-state md-icon="icons/view_list.svg" :md-label="translated.LOGS_EMPTY">
                <p class="md-empty-state-description">{{ translated.LOGS_EMPTY_DESCRIPTION_1 }}
                    <br>{{ translated.LOGS_EMPTY_DESCRIPTION_2 }}</p>
                <md-button disabled class="md-primary md-raised">{{ translated.LOGS_CREATE }}</md-button>
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