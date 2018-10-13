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
        <snackbar ref="snackbar"></snackbar>
        <bottom-bar></bottom-bar>
    </div>
</template>

<script>
    import http from './../modules/http.vue';
    import storage from './../modules/storage.vue';
    import eventBus from './../modules/event.vue';
    import translation from './../modules/translation.vue';
    import toolbar from './../container/toolbar.vue';
    import snackbar from './../modules/snackbar.vue';
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
                startDateModal: false,
                endDateModal: false,
                startTimeModal: false,
                endTimeModal: false
            };
        },
        methods: {
            convertCharge() {
                // boolean conversion for toggle
                if (this.log.charge) this.log.charge = true;
                else this.log.charge = false;
            },
            saveLog() {
                var self = this,
                    log = self.log;

                self.formatDateTime(false);
                delete log.stats;
                http.sendRequest(((self.$route.query.id) ? 'put' : 'post'), 'logdetail', {
                    akey: storage.getValue('akey'),
                    token: storage.getValue('token'),
                    log: log
                }, err => {
                    if (!err) {
                        self.$refs.snackbar.setMessage('LOG_SAVED', false, 'success');
                        self.$router.push('/logs');
                    } else {
                        self.$refs.snackbar.setMessage('LOG_SAVE_ERROR', false, 'error');
                    }
                });
            },
            formatDateTime(fromDb) {
                if (!fromDb && this.startDate.length && this.startTime.length && this.endDate.length && this.endTime.length) {
                    var tmpStart = new Date(),
                        dateStart = this.startDate.split('-'),
                        timeStart = this.startTime.split(':'),
                        tmpEnd = new Date(),
                        dateEnd = this.endDate.split('-'),
                        timeEnd = this.endTime.split(':'),
                        origStart = new Date(this.log.start * 1000),
                        origEnd = new Date(this.log.end * 1000);

                    // build the timestamp
                    tmpStart.setFullYear(dateStart[0]);
                    tmpStart.setMonth(dateStart[1] - 1);
                    tmpStart.setDate(('0' + dateStart[2].slice(-2)));
                    tmpStart.setHours(timeStart[0]);
                    tmpStart.setMinutes(timeStart[1]);
                    tmpStart.setSeconds(origStart.getSeconds() || 0);
                    tmpEnd.setFullYear(dateEnd[0]);
                    tmpEnd.setMonth(dateEnd[1] - 1);
                    tmpEnd.setDate(('0' + dateEnd[2].slice(-2)));
                    tmpEnd.setHours(timeEnd[0]);
                    tmpEnd.setMinutes(timeEnd[1]);
                    tmpEnd.setSeconds(origEnd.getSeconds() || 0);
                    this.log.start = parseInt(tmpStart.getTime() / 1000);
                    this.log.end = parseInt(tmpEnd.getTime() / 1000);
                } else if (fromDb && this.log.start && this.log.end) {
                    var tmpStart = new Date(this.log.start * 1000),
                        tmpEnd = new Date(this.log.end * 1000);
                    
                    // build the date and time string
                    this.startDate = tmpStart.getFullYear() + '-' + ('0' + (tmpStart.getMonth() + 1)).slice(-2) + '-' +
                        ('0' + tmpStart.getDate()).slice(-2);
                    this.endDate = tmpEnd.getFullYear() + '-' + ('0' + (tmpEnd.getMonth() + 1)).slice(-2) + '-' + ('0' +
                        tmpEnd.getDate()).slice(-2);
                    this.startTime = ('0' + tmpStart.getHours()).slice(-2) + ':' + ('0' + tmpStart.getMinutes()).slice(-2);
                    this.endTime = ('0' + tmpEnd.getHours()).slice(-2) + ':' + ('0' + tmpEnd.getMinutes()).slice(-2);
                } else {
                    // TODO
                }
            }
        },
        watch: {
            'log.charge': 'convertCharge'
        },
        components: {
            toolbar,
            snackbar,
            bottomBar
        },
        created() {
            var self = this;

            self.translated = translation.translatePage();
            eventBus.$off('log_save');
            eventBus.$on('log_save', () => self.saveLog());
            if (self.$route.query.id) {
                http.sendRequest('get', 'logdetail', {
                    id: self.$route.query.id,
                    akey: storage.getValue('akey'),
                    token: storage.getValue('token')
                }, (err, log) => {
                    if (!err && log != null) {
                        self.log = log;
                        self.formatDateTime(true);
                    } else {
                        // TODO
                    }
                });
            }
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