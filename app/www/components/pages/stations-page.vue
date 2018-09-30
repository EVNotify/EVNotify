<template>
    <div>
        <toolbar></toolbar>
        <div class="content-within-page">
            <md-tabs class="md-transparent" md-alignment="fixed">
                <md-tab id="tab-list" :md-label="translated.LIST"></md-tab>
                <md-tab id="tab-favorites" :md-label="translated.FAVORITES"></md-tab>
                <md-tab id="tab-map" :md-label="translated.MAP"></md-tab>
            </md-tabs>
            <md-empty-state v-if="!stations.length" md-icon="icons/ev_station.svg" :md-label="translated.STATIONS_EMPTY">
                <p class="md-empty-state-description">{{ translated.STATIONS_EMPTY_DESCRIPTION_1 }}
                    <br>{{ translated.STATIONS_EMPTY_DESCRIPTION_2 }}</p>
            </md-empty-state>
            <div v-if="stations.length">
                <md-card md-with-hover v-for="(station, index) in stations" :key="index" class="station-card">
                    <div @click="openStation(station.ge_id)">
                        <md-ripple>
                            <md-card-header>
                                <div>
                                    <div class="md-title">{{ station.name }}</div>
                                    <img v-if="station.verified && !station.fault_report" src="icons/verified.svg"
                                        class="status-icon">
                                    <img v-if="station.fault_report" src="icons/error.svg" class="status-icon">
                                    <img v-if="!station.fault_report && !station.verified" src="icons/unverified.svg"
                                        class="status-icon">
                                </div>
                                <div class="md-subhead">
                                    {{ station.address.street }}, {{ station.address.city }}
                                </div>
                            </md-card-header>

                            <md-card-content>
                                <ul class="plugs-list">
                                    <li v-for="(chargepoint, index) in station.chargepoints" :key="index">
                                        {{ chargepoint.count }}x {{ chargepoint.type }} [{{ chargepoint.power }}kW]
                                    </li>
                                </ul>
                            </md-card-content>

                            <md-card-actions>
                                <div class="linear-distance">{{ translated.LINEAR_DISTANCE }}: <b>{{
                                        parseFloat(station.distance).toFixed(2)}}km</b>
                                </div>
                                <md-button class="md-icon-button" @click="favorite(station, $event)">
                                    <img src="icons/favorite_border.svg">
                                </md-button>
                                <md-button class="md-icon-button" @click="navigate(station, $event)">
                                    <img src="icons/directions.svg">
                                </md-button>
                            </md-card-actions>
                        </md-ripple>
                    </div>
                </md-card>
            </div>
        </div>
        <bottom-bar></bottom-bar>
    </div>
</template>

<script>
    import http from './../modules/http.vue';
    import toolbar from './../container/toolbar.vue';
    import translation from './../modules/translation.vue';
    import bottomBar from './../container/bottom-bar.vue';

    export default {
        data() {
            return {
                translated: {},
                coords: {},
                stations: []
            };
        },
        methods: {
            openStation(id) {
                this.$router.push({
                    path: 'station',
                    query: {
                        id
                    }
                });
            },
            navigate(station, event) {
                event.stopPropagation();
                if (window.cordova && window.launchnavigator) launchnavigator.navigate([station.coordinates.lat, station.coordinates.lng]);
            },
            favorite(station, event) {
                event.stopPropagation();
            }
        },
        components: {
            toolbar,
            bottomBar
        },
        created() {
            var self = this;

            this.translated = translation.translatePage();
            navigator.geolocation.getCurrentPosition(posObj => {
                self.coords = posObj.coords;
                // retrieve stations
                http.sendRequest('get', 'stations', {
                    lat: self.coords.latitude,
                    lng: self.coords.longitude
                }, (err, stations) => {
                    if (!err && Array.isArray(stations)) {
                        self.stations = stations;
                    } else {
                        // TODO
                    }
                });
            }, err => {
                // TODO
            });
        }
    }
</script>

<style scoped>
    .station-card {
        border-bottom: 1px solid #898989;
    }

    .station-card .md-card-header,
    .station-card .md-card-content,
    .station-card .md-card-actions {
        padding-bottom: 0;
        padding-top: 0;
    }

    .station-card .md-title {
        width: calc(100% - 24px);
        font-size: 20px;
    }

    .station-card .md-card-header {
        margin-top: 8px;
    }

    .station-card .md-subhead {
        font-style: italic;
        font-weight: bold;
    }

    .station-card .status-icon {
        position: absolute;
        right: 0;
        top: 20px;
    }

    .station-card .linear-distance {
        position: absolute;
        left: 16px;
    }

    .plugs-list {
        margin: 0;
    }
</style>