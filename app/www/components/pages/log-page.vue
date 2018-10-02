<template>
    <div>
        <toolbar></toolbar>
        <div class="content-within-page">
            <form class="md-layout" @submit.prevent="setLog()">
                <md-card class="md-layout-item md-size-50 md-small-size-100">
                    <md-card-header>
                        <div class="md-title">{{ translated.DETAILS }}</div>
                    </md-card-header>
                    <md-card-content class="md-layout md-gutter">
                        <div class="md-layout-item md-small-size-100">
                            <md-field>
                                <label for="title">{{ translated.TITLE }}</label>
                                <md-input v-model="log.title"></md-input>
                            </md-field>
                            <v-menu
                                :close-on-content-click="false"
                                v-model="showStart"
                                :nudge-right="40"
                                lazy
                                transition="scale-transition"
                                offset-y
                                full-width
                                max-width="290px"
                                min-width="290px"
                                >
                                <v-text-field
                                    slot="activator"
                                    v-model="start"
                                    label="Date (read only text field)"
                                    hint="MM/DD/YYYY format"
                                    persistent-hint
                                    prepend-icon="event"
                                    readonly
                                ></v-text-field>
                                <v-date-picker v-model="time" no-title @input="showStart = false" dark first-day-of-week="1"></v-date-picker>
                                </v-menu>
                            <!-- <v-date-picker v-model="time" :landscape="true" dark first-day-of-week="1"></v-date-picker> -->
                        </div>
                    </md-card-content>
                </md-card>
            </form>
        </div>
        <bottom-bar></bottom-bar>
    </div>
</template>

<script>
    import translation from './../modules/translation.vue';
    import toolbar from './../container/toolbar.vue';
    import bottomBar from './../container/bottom-bar.vue';

    export default {
        data() {
            return {
                translated: {},
                log: {},
                time: '',
                date: 0,
                start: '',
                end: '',
                showStart: false
            };
        },
        methods: {

        },
        components: {
            toolbar,
            bottomBar
        },
        created() {
            this.translated = translation.translatePage();
        }
    }
</script>

<style>
.v-picker__body.theme--dark {
    width: auto !important;
}
</style>
