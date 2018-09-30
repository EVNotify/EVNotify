<template>
    <div>
        <toolbar></toolbar>
        <div class="content-within-page">
            <md-card v-if="station.ge_id">
                <md-card-media-cover md-solid>
                    <md-card-media md-ratio="16:9">
                        <img src="img/card-sky.jpg" alt="Skyscraper">
                    </md-card-media>
                    <md-card-area>
                        <md-card-header>
                            <span class="md-title">{{ station.name }}</span>
                            <span class="md-subhead">{{ station.address.street }} <br> {{ station.address.postcode }}
                                {{ station.address.city }} <br> {{ station.address.country }}</span>
                            <div class="station-network-operator">
                                {{ station.network }} ({{ station.operator }})
                            </div>
                            <div class="station-status">
                                <img v-if="station.verified && !station.fault_report" src="icons/verified.svg">
                                <img v-if="!station.verified && !station.fault_report" src="icons/unverified.svg">
                                <b>
                                    <span v-if="station.verified && !station.fault_report">{{ translated.VERIFIED }}</span>
                                    <span v-if="!station.verified && !station.fault_report">{{ translated.UNVERIFIED }}</span>
                                </b>
                                <img v-if="station.fault_report" src="icons/error.svg">
                                <b>
                                    <span v-if="station.fault_report">{{ translated.MALFUNCTION }}</span>
                                </b>
                            </div>
                        </md-card-header>
                    </md-card-area>
                </md-card-media-cover>
                <md-card-content>
                    <h3 class="md-subheading">{{ translated.PLUGS }}</h3>
                    <ul>
                        <li v-for="(chargepoint, index) in station.chargepoints" :key="index">
                            {{ chargepoint.count }}x {{ chargepoint.type }} [{{ chargepoint.power }}kW]
                        </li>
                    </ul>
                    <div class="md-subhead">
                        <div v-if="station.cost.freecharging" class="status-overview-icon">
                            <img src="icons/money_off.svg">
                            <b><span>{{ translated.FREE_CHARGING }}</span></b>
                        </div>
                        <div v-if="station.cost.freeparking" class="status-overview-icon">
                            <img src="icons/parking.svg">
                            <b><span>{{ translated.FREE_PARKING }}</span></b>
                        </div>
                        <div v-if="station.barrierfree" class="status-overview-icon">
                            <img src="icons/accessibility.svg">
                            <b><span>{{ translated.BARRIERFREE }}</span></b>
                        </div>
                        <div v-if="station.openinghours['24/7']" class="status-overview-icon">
                            <img src="icons/access_time.svg">
                            <b><span>24/7</span></b>
                        </div>
                    </div>
                    <div style="clear: both"></div>
                    <b>{{ translated.GENERAL }}:</b><br>{{ station.general_information || '-' }}<br>
                    <b>{{ translated.PASTIME }}:</b><br>{{ station.ladeweile || '-' }}<br>
                    <b>{{ translated.LOCATION_DESCRIPTION }}:</b><br>{{ station.location_description || '-' }}<br>
                </md-card-content>
                <md-card-content>
                    <h3 class="md-subheading">{{ translated.COSTS }}</h3>
                    <b>{{ translated.SHORT_DESCRIPTION }}:</b><br>{{ station.cost.description_short || '-'}}<br>
                    <b>{{ translated.DESCRIPTION }}:</b><br>{{ station.cost.description_long || '-' }}<br>
                </md-card-content>
                <md-card-content>
                    <h3 class="md-subheading">{{ translated.OPENING_HOURS }}</h3>
                    <b>{{ translated.DESCRIPTION }}:</b><br>{{ station.openinghours.description || '-' }}<br>
                    <div v-if="station.openinghours['24/7']">
                        <img src="icons/access_time.svg">
                        <b><span>24/7</span></b>
                    </div>
                    <div v-if="!station.openinghours['24/7']">
                        <div v-for="(day, index) in Object.keys(station.openinghours.days)" :key="index">
                            <span><b>{{ translated[day.toUpperCase()] }}:</b> {{
                                formatOpeningTime(station.openinghours.days[day]) }}</span>
                        </div>
                    </div>
                </md-card-content>
                <md-card-content>
                    {{ translated.SOURCE }}: <a href="https://goingelectric.de">GoingElectric.de</a>
                </md-card-content>
            </md-card>
        </div>
        <bottom-bar></bottom-bar>
    </div>
</template>

<script>
    import http from './../modules/http.vue';
    import eventBus from './../modules/event.vue';
    import translation from './../modules/translation.vue';
    import toolbar from './../container/toolbar.vue';
    import bottomBar from './../container/bottom-bar.vue';

    export default {
        data() {
            return {
                station: {},
                translated: {}
            };
        },
        methods: {
            formatOpeningTime(time) {
                if (time === 'closed') return this.translated.CLOSED;
                return time.replace('from', '').replace('till', '').replace('  ', '-');
            }
        },
        components: {
            toolbar,
            bottomBar
        },
        created() {
            var self = this;

            self.translated = translation.translatePage();
            if (self.$route.query.id) {
                eventBus.$on('station_openInNew', () => {
                    if (self.station.url) window.open(self.station.url, '_blank');     
                });
                eventBus.$on('station_navigate', () => {
                    if (self.station.coordinates && window.cordova && window.launchnavigator) {
                        launchnavigator.navigate([self.station.coordinates.lat, self.station.coordinates.lng]);
                    }
                });
                // get station details
                http.sendRequest('get', 'station', {
                    id: self.$route.query.id
                }, (err, station) => {
                    if (!err && station) {
                        self.station = station;
                        setTimeout(() => window.scrollTo(0,0), 200);
                    } else {
                        // TODO
                    }
                });
            }
        }
    }
</script>

<style scoped>
    .station-network-operator {
        position: absolute;
        left: 16px;
        bottom: 8px;
        font-style: italic;
        font-size: 11px;
    }

    .station-status {
        position: absolute;
        right: 16px;
        bottom: 16px;
    }

    .status-overview-icon {
        float: left;
    }
</style>