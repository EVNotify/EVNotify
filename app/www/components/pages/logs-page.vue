<template>
    <div>
        <toolbar></toolbar>
        <div class="content-within-page">
            <md-tabs ref="tabs" class="md-transparent" md-alignment="fixed" @md-changed="loadLogs()">
                <md-tab id="tab-charges" :md-label="translated.CHARGES"></md-tab>
                <md-tab id="tab-drives" :md-label="translated.DRIVES"></md-tab>
                <md-tab id="tab-statistics" :md-label="translated.STATISTICS"></md-tab>
            </md-tabs>
            <md-empty-state v-if="!logs.length" md-icon="icons/view_list.svg" :md-label="translated.LOGS_EMPTY">
                <p class="md-empty-state-description">{{ translated.LOGS_EMPTY_DESCRIPTION_1 }}
                    <br>{{ translated.LOGS_EMPTY_DESCRIPTION_2 }}</p>
                <md-button class="md-primary md-raised" @click="createLog()">{{ translated.LOGS_CREATE }}</md-button>
            </md-empty-state>
            <md-list v-if="logs.length" class="md-double-line">
                <md-list-item v-for="(log, index) in logs" :key="index">
                    <div class="md-list-item-text" @click="openLog(log.id)">
                        <span>{{ log.title || '-' }}</span>
                        <span>{{ formatDate(log.start) }} - {{ formatDate(log.end) }}</span>
                    </div>
                </md-list-item>
            </md-list>
            <md-button v-if="logs.length" class="md-fab md-plain md-fab-bottom-right" @click="createLog()">
                <md-icon md-src="icons/add.svg"></md-icon>
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
                logs: []
            };
        },
        methods: {
            formatDate(timestamp) {
                return helper.formatDate(timestamp);
            },
            loadLogs() {
                var self = this;

                if (self.$refs.tabs.activeTab !== 'tab-statistics') {
                    http.sendRequest('get', 'logs', {
                        akey: storage.getValue('akey'),
                        token: storage.getValue('token'),
                        charge: ((self.$refs.tabs.activeTab !== 'tab-drives') ? 1 : 0)
                    }, (err, logs) => {
                        if (!err && logs) self.logs = logs;
                        else {
                            // TODO
                        }
                    });
                }
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
    }
</style>

<style>
    .md-button.md-fab .md-ripple .md-icon.md-theme-default.md-icon-image svg {
        fill: #fff;
    }
</style>
