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
                            <md-dialog-confirm
                                :md-active.sync="deleteLogDialog"
                                :md-title="translated.DELETE_LOG"
                                :md-content="translated.DELETE_LOG_TEXT"
                                :md-confirm-text="translated.DELETE"
                                :md-cancel-text="translated.CANCEL"
                                @md-cancel="deleteLogDialog = false"
                                @md-confirm="deleteLogDialog = false; deleteLog();"
                            />
                            <md-button class="md-raised md-accent log-delete-btn" @click="deleteLogDialog = true" v-if="log.id">{{ translated.DELETE}}</md-button>
                        </div>
                    </md-card-content>
                    <md-card-content>
                        <canvas id="chart" ref="chart" width="400" height="400"></canvas>
                    </md-card-content>
                    <md-card-content>
                        <div id="log-map" ref="map"></div>
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
    import helper from './../modules/helper.vue';
    import storage from './../modules/storage.vue';
    import eventBus from './../modules/event.vue';
    import translation from './../modules/translation.vue';
    import toolbar from './../container/toolbar.vue';
    import snackbar from './../modules/snackbar.vue';
    import bottomBar from './../container/bottom-bar.vue';

    export default {
        data() {
            return {
                deleteLogDialog: false,
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
                }, true, err => {
                    if (!err) {
                        self.$refs.snackbar.setMessage('LOG_SAVED', false, 'success');
                        self.$router.push('/logs');
                    } else {
                        self.$refs.snackbar.setMessage('LOG_SAVE_ERROR', false, 'error');
                    }
                });
            },
            deleteLog() {
                var self = this;

                http.sendRequest('delete', 'logdetail', {
                    akey: storage.getValue('akey'),
                    token: storage.getValue('token'),
                    id: self.log.id
                }, true, err => {
                    if (!err) {
                        self.$refs.snackbar.setMessage('LOG_DELETED', false, 'success');
                        self.$router.push('/logs');
                    } else {
                        self.$refs.snackbar.setMessage('LOG_DELETED_ERROR', false, 'error');
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
                    this.startTime = ('0' + tmpStart.getHours()).slice(-2) + ':' + ('0' + tmpStart.getMinutes()).slice(
                        -2);
                    this.endTime = ('0' + tmpEnd.getHours()).slice(-2) + ':' + ('0' + tmpEnd.getMinutes()).slice(-2);
                } else {
                    // TODO
                }
            },
            createChart() {
                var self = this;
                var charging = parseInt(self.log.charge);
                var ctx = document.getElementById("chart").getContext('2d');
                var myChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: self.log.stats.sort((a, b) => a.timestamp - b.timestamp).map(stat => helper.formatDate(
                            stat.timestamp)),
                        datasets: [{
                                label: 'SOC_DISPLAY',
                                lineTension: 0,
                                spanGaps: true,
                                fill: false,
                                borderColor: '#50f84f',
                                data: self.log.stats.map(stat => stat.soc_display)
                            }, {
                                label: 'SOC_BMS',
                                lineTension: 0,
                                spanGaps: true,
                                fill: false,
                                borderColor: '#f83be1',
                                data: self.log.stats.map(stat => stat.soc_bms)
                            }, {
                                label: 'DC_BATTERY_POWER',
                                lineTension: 0,
                                spanGaps: true,
                                fill: false,
                                borderColor: '#324df8',
                                data: self.log.stats.map(stat => stat.dc_battery_power ? stat.dc_battery_power *
                                    ((charging) ? -1 : 1) : stat.dc_battery_power)
                            }, {
                                label: 'Battery Temperature (Min) °C',
                                borderColor: '#00b8ff',
                                fill: false,
                                lineTension: 0,
                                spanGaps: true,
                                data: self.log.stats.map(stat => stat.battery_min_temperature),
                            },
                            {
                                label: 'Battery Temperature (Max) °C',
                                borderColor: '#b31212',
                                fill: false,
                                lineTension: 0,
                                spanGaps: true,
                                data: self.log.stats.map(stat => stat.battery_max_temperature),
                            },
                            {
                                label: 'Battery Temperature (Inlet) °C',
                                borderColor: '#5a5252',
                                fill: false,
                                lineTension: 0,
                                spanGaps: true,
                                data: self.log.stats.map(stat => stat.battery_inlet_temperature),
                            }
                        ].concat(((charging) ? [] : [{
                            label: 'GPS_SPEED',
                            borderColor: '#f81d28',
                            fill: false,
                            lineTension: 0,
                            spanGaps: true,
                            data: self.log.stats.map(stats => stats.gps_speed ? stats.gps_speed *
                                3.6 : stats.gps_speed)
                        }]))
                    },
                    options: {
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true
                                }
                            }]
                        }
                    }
                });
            },
            buildMap() {
                var self = this,
                    coords = self.log.stats.filter(stat => stat.latitude && stat.longitude).map(stat => {
                        return {
                            lat: stat.latitude,
                            lng: stat.longitude
                        };
                    });

                if(!coords.length || typeof MAPBOX_TOKEN !== 'string') return;

                // Wait one tick to let Vue update the DOM to be rendered correctly, before acccesing the map
                Vue.nextTick(() => {
                    var map = L.map('log-map');

                    map.fitBounds(L.polyline(coords, {
                        color: '#4589fc'
                    }).addTo(map).getBounds());

                    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
                        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                        maxZoom: 18,
                        id: 'mapbox.streets',
                        accessToken: MAPBOX_TOKEN
                    }).addTo(map);
                });
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
        mounted() {
            var self = this;

            self.translated = translation.translatePage();
            eventBus.$off('log_save');
            eventBus.$on('log_save', () => self.saveLog());
            if (self.$route.query.id) {
                http.sendRequest('get', 'logdetail', {
                    id: self.$route.query.id,
                    akey: storage.getValue('akey'),
                    token: storage.getValue('token')
                }, true, (err, log) => {
                    if (!err && log != null) {
                        self.log = log;
                        self.formatDateTime(true);
                        if (Array.isArray(self.log.stats)) {
                            self.createChart();
                            eventBus.$off('deviceReady');
                            if (self.$root.deviceReady) self.buildMap();
                            else {
                                eventBus.$on('deviceReady', function () {
                                    self.buildMap();
                                });
                            }
                        }
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
    .log-delete-btn {
        float: right;
    }
</style>


<style>
    .v-picker__body.theme--dark {
        width: auto !important;
    }

    #log-map {
        width: 100%;
        height: 500px;
    }
</style>