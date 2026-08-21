<template>
    <div>
        <toolbar></toolbar>
        <div class="content-within-page">
            <v-layout>
                <v-flex xs12 sm8 offset-sm2>
                    <v-card>
                        <v-card-title primary-title>
                            <div class="debug-page">
                                <h2 class="debug-title">{{ translated.DEBUG_DATA }}</h2>
                                <p class="debug-description">{{ translated.DEBUG_DATA_DESCRIPTION }}</p>
                                <md-button class="md-primary md-raised debug-clear-button" @click="clearHistory()">
                                    {{ translated.DELETE }}
                                </md-button>
                                <p v-if="!history.length" class="debug-empty">{{ translated.DEBUG_DATA_EMPTY }}</p>
                                <div v-for="entry in history" :key="entry.id" class="debug-entry">
                                    <div class="debug-entry-header">
                                        <strong>{{ translated.CAR }}:</strong> {{ translated[entry.car] || entry.car }}
                                        <span class="debug-entry-time">{{ formatTimestamp(entry.timestamp) }}</span>
                                    </div>
                                    <div class="debug-entry-section">
                                        <strong>{{ translated.DEBUG_COMMAND }}:</strong> {{ entry.command || '-' }}
                                    </div>
                                    <div class="debug-entry-section">
                                        <strong>{{ translated.DEBUG_RAW_DATA }}:</strong>
                                        <pre class="debug-raw">{{ formatRawLines(entry.raw) }}</pre>
                                    </div>
                                    <div class="debug-entry-section">
                                        <strong>{{ translated.DEBUG_INTERPRETED_DATA }}:</strong>
                                        <table class="debug-table">
                                            <thead>
                                                <tr>
                                                    <th>{{ translated.DEBUG_FIELD }}</th>
                                                    <th>{{ translated.DEBUG_RAW }}</th>
                                                    <th>{{ translated.DEBUG_VALUE }}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="row in getInterpretedRows(entry)" :key="row.key">
                                                    <td>{{ translated[row.key] || row.key }}</td>
                                                    <td>{{ row.raw || '-' }}</td>
                                                    <td>{{ formatValue(row.value) }}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </v-card-title>
                    </v-card>
                </v-flex>
            </v-layout>
        </div>
        <bottom-bar></bottom-bar>
    </div>
</template>

<script>
    import toolbar from './../container/toolbar.vue';
    import bottomBar from './../container/bottom-bar.vue';
    import translation from './../modules/translation.vue';
    import eventBus from './../modules/event.vue';
    import obdDebug from './../../js/obd-debug.js';

    export default {
        data() {
            return {
                translated: {},
                history: []
            };
        },
        methods: {
            loadHistory() {
                this.history = obdDebug.getHistory().slice().reverse();
            },
            clearHistory() {
                obdDebug.clearHistory();
                this.history = [];
            },
            formatTimestamp(timestamp) {
                return this.$root.MomentJS(new Date(timestamp * 1000)).format('YYYY-MM-DD HH:mm:ss');
            },
            formatRawLines(raw) {
                return obdDebug.extractBlocks(raw).map(entry => entry.formatted).join('\n') || raw;
            },
            getInterpretedRows(entry) {
                var rawMap = obdDebug.buildFieldRawMap(entry.car, entry.command, entry.raw);

                return obdDebug.getRelevantKeys(entry.interpreted).map(key => ({
                    key,
                    raw: rawMap[key] ? obdDebug.splitHexPairs(rawMap[key]) : '',
                    value: entry.interpreted[key]
                }));
            },
            formatValue(value) {
                if (typeof value === 'boolean') return value ? this.translated.YES : this.translated.NO;
                return (value == null || value === '') ? '-' : value;
            }
        },
        created() {
            this.translated = translation.translatePage();
            this.loadHistory();
            eventBus.$off('obd2DebugDataLive');
            eventBus.$on('obd2DebugDataLive', () => this.loadHistory());
        },
        beforeDestroy() {
            eventBus.$off('obd2DebugDataLive');
        },
        components: {
            toolbar,
            bottomBar
        }
    };
</script>

<style scoped>
.debug-page {
    width: 100%;
}

.debug-title {
    margin: 0 0 8px;
}

.debug-description {
    margin: 0 0 16px;
}

.debug-clear-button {
    margin: 0 0 16px;
}

.debug-empty {
    width: 100%;
    margin: 0;
}

.debug-entry {
    width: 100%;
    padding: 16px 0;
    border-top: 1px solid #eee;
}

.debug-entry-header,
.debug-entry-section {
    margin-bottom: 12px;
}

.debug-entry-time {
    float: right;
}

.debug-raw {
    margin: 8px 0 0;
    padding: 12px;
    background: #f5f5f5;
    white-space: pre-wrap;
    word-break: break-all;
}

.debug-table {
    width: 100%;
    margin-top: 8px;
    border-collapse: collapse;
}

.debug-table th,
.debug-table td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid #eee;
    vertical-align: top;
    word-break: break-word;
}
</style>
