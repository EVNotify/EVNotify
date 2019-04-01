<template>
    <div>
        <toolbar></toolbar>
        <div class="content-within-page">
            <md-tabs ref="tabs" class="md-transparent logs-tabs" md-alignment="fixed" @md-changed="loadLogs()">
                <md-tab id="tab-charges" :md-label="translated.CHARGES"></md-tab>
                <md-tab id="tab-drives" :md-label="translated.DRIVES"></md-tab>
                <md-tab id="tab-statistics" :md-label="translated.STATISTICS" v-if="notApple"></md-tab>
            </md-tabs>
            <md-empty-state v-if="!logs.length" >
                <strong class="md-empty-state-label">{{ translated.LOGS_EMPTY }}</strong>
                <i class="md-svg-loader md-icon md-icon-image md-empty-state-icon md-theme-default">
                    <img src="icons/view_list.svg" class="emptystationicon" />
                </i>
                <p class="md-empty-state-description">{{ translated.LOGS_EMPTY_DESCRIPTION_1 }}
                    <br>{{ translated.LOGS_EMPTY_DESCRIPTION_2 }}</p>
                <md-button class="md-primary md-raised" @click="createLog()">{{ translated.LOGS_CREATE }}</md-button>
            </md-empty-state>
            <md-list v-if="logs.length && !notImplemented" class="md-double-line list">
                <md-list-item v-for="(log, index) in logs" :key="index">
                    <div class="md-list-item-text" @click="openLog(log.id)">
                        <span>{{ log.title || '-' }}</span>
                        <span>{{ formatDate(log.start) }} - {{ formatDate(log.end) }}</span>
                    </div>
                </md-list-item>
            </md-list>
            <md-empty-state v-if="notImplemented" class="missing">
                <strong class="md-empty-state-label">{{ translated.MISSING_FEATURE }}</strong>
                <i class="md-svg-loader md-icon md-icon-image md-empty-state-icon md-theme-default">
                    <img src="icons/build.svg" class="emptystationicon" />
                </i>
                <p class="md-empty-state-description">{{ translated.MISSING_FEATURE_DESCRIPTION }}</p>
            </md-empty-state>
            <md-button v-if="logs.length && !notImplemented" class="md-fab md-plain md-fab-bottom-right" @click="createLog()">
                <img src="icons/white/add.svg" />
            </md-button>
        </div>
        <bottom-bar></bottom-bar>
    </div>
</template>

<script>
    import http from './../modules/http.vue';
    import storage from './../modules/storage.vue';
    import helper from './../modules/helper.vue';
    import toolbar from './../container/toolbar.vue';
    import translation from './../modules/translation.vue';
    import bottomBar from './../container/bottom-bar.vue';

    export default {
        data() {
            return {
                translated: {},
                logs: [],
                notImplemented: false,
                notApple: false
            };
        },
        methods: {
            formatDate(timestamp) {
                return helper.formatDate(timestamp);
            },
            loadLogs() {
                var self = this;

                if (self.$refs.tabs.activeTab !== 'tab-statistics') {
                    self.notImplemented = false;
                    http.sendRequest('get', 'logs', {
                        akey: storage.getValue('akey'),
                        token: storage.getValue('token'),
                        charge: ((self.$refs.tabs.activeTab !== 'tab-drives') ? 1 : 0)
                    }, true, (err, logs) => {
                        if (!err && logs) self.logs = logs;
                        else {
                            // TODO
                        }
                    });
                } else self.notImplemented = true;
            },
            openLog(id) {
                this.$router.push({
                    path: '/log',
                    query: {
                        id
                    }
                });
            },
            createLog() {
                this.$router.push('/log');
            }
        },
        components: {
            toolbar,
            bottomBar
        },
        created() {
            this.translated = translation.translatePage();
            this.notApple = this.$root.appPlatform.indexOf('ios') === -1 && this.$root.appPlatform.indexOf('mac') === -1;
        },
        mounted() {
            this.loadLogs();
        }
    }
</script>

<style scoped>
    .md-list-item {
        border-bottom: 1px solid #ddd;
    }

    .md-fab.md-fab-bottom-right {
        bottom: 80px;
        position: fixed;
    }

    .list,
    .missing {
        margin-top: 48px;
    }
</style>

<style>
    .md-button.md-fab .md-ripple .md-icon.md-theme-default.md-icon-image svg {
        fill: #fff;
    }
    .md-tabs.logs-tabs.md-theme-default .md-tabs-navigation {
        position: fixed;
        top: 56px;
        z-index: 3;
        background-color: white !important;
        width: 100%;
    }
</style>
