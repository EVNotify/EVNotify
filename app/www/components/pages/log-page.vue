<template>
    <div>
        <toolbar></toolbar>
        <div class="content-within-page">
            <form class="md-layout" @submit.prevent="setLog()">
                <md-card class="md-layout-item md-size-50 md-small-size-100">
                    <md-card-header>
                        <div class="md-title">{{ translated.DETAILS }}</div>
                        <md-switch class="is-charge" v-model="log.charge">{{ translated.CHARGE }}</md-switch>
                    </md-card-header>
                    <md-card-content class="md-layout md-gutter">
                        <div class="md-layout-item md-small-size-100">
                            <md-field>
                                <label for="title">{{ translated.TITLE }}</label>
                                <md-input v-model="log.title"></md-input>
                            </md-field>
                            <v-dialog ref="startDateDialog" v-model="startDateModal" :return-value.sync="startDate"
                                persistent lazy full-width width="290px">
                                <v-text-field slot="activator" v-model="startDate" :label="translated.START_DATE"
                                    prepend-icon="event" readonly></v-text-field>
                                <v-date-picker dark v-model="startDate" scrollable @input="$refs.startDateDialog.save(startDate)"
                                    no-title>
                                </v-date-picker>
                            </v-dialog>
                            <v-dialog ref="startTimeDialog" v-model="startTimeModal" :return-value.sync="startTime"
                                persistent lazy full-width width="290px">
                                <v-text-field slot="activator" v-model="startTime" :label="translated.START_TIME"
                                    prepend-icon="access_time" readonly></v-text-field>
                                <v-time-picker dark v-model="startTime" full-width color="#424242" format="24hr">
                                    <v-spacer></v-spacer>
                                    <v-btn flat color="primary" @click="startTimeModal = false">{{ translated.CANCEL }}</v-btn>
                                    <v-btn flat color="primary" @click="$refs.startTimeDialog.save(startTime)">
                                        {{ translated.DONE }}
                                    </v-btn>
                                </v-time-picker>
                            </v-dialog>
                            <v-dialog ref="endDateDialog" v-model="endDateModal" :return-value.sync="endDate"
                                persistent lazy full-width width="290px">
                                <v-text-field slot="activator" v-model="endDate" :label="translated.END_DATE"
                                    prepend-icon="event" readonly></v-text-field>
                                <v-date-picker dark v-model="endDate" scrollable @input="$refs.endDateDialog.save(endDate)"
                                    no-title>
                                </v-date-picker>
                            </v-dialog>
                            <v-dialog ref="endTimeDialog" v-model="endTimeModal" :return-value.sync="endTime"
                                persistent lazy full-width width="290px">
                                <v-text-field slot="activator" v-model="endTime" :label="translated.END_TIME"
                                    prepend-icon="access_time" readonly></v-text-field>
                                <v-time-picker dark v-model="endTime" full-width color="#424242" format="24hr">
                                    <v-spacer></v-spacer>
                                    <v-btn flat color="primary" @click="endTimeModal = false">{{ translated.CANCEL }}</v-btn>
                                    <v-btn flat color="primary" @click="$refs.endTimeDialog.save(endTime)">
                                        {{ translated.DONE }}
                                    </v-btn>
                                </v-time-picker>
                            </v-dialog>
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
                startDate: '',
                endDate: '',
                startTime: '',
                endTime: '',
                start: '',
                end: '',
                startDateModal: false,
                endDateModal: false,
                startTimeModal: false,
                endTimeModal: false
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

<style scoped>
    .is-charge {
        position: absolute;
        right: 0;
        top: 16px;
    }
</style>


<style>
    .v-picker__body.theme--dark {
        width: auto !important;
    }
</style>