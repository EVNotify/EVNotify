<template>
    <div>
        <toolbar></toolbar>
        <md-list class="content-within-page" md-expand-single="true">
            <form class="form inner-form">
                <md-subheader>{{ translated.GENERAL }}</md-subheader>
                <md-list-item md-expand>
                    <md-icon md-src="icons/language.svg"></md-icon>
                    <span class="md-list-item-text">{{ translated.LANGUAGE}}</span>
                    <md-list slot="md-expand">
                        <md-field>
                            <label for="lng">{{ translated.LANGUAGE }}</label>
                            <md-select v-model="settings.lng" required>
                                <md-option value="de">{{ translated.GERMAN }}</md-option>
                                <md-option value="en">{{ translated.ENGLISH }}</md-option>
                            </md-select>
                        </md-field>
                    </md-list>
                </md-list-item>
                <md-subheader>{{ translated.USER }}</md-subheader>
                <md-list-item>
                    <md-icon md-src="icons/account_circle.svg"></md-icon>
                    <span class="md-list-item-text">{{ translated.CREDENTIALS }}</span>
                </md-list-item>
                <md-subheader>{{ translated.CAR}}</md-subheader>
                <md-list-item md-expand>
                    <md-icon md-src="icons/car.svg"></md-icon>
                    <span class="md-list-item-text">{{ translated.CAR_SELECTION }}</span>
                    <md-list slot="md-expand">
                        <md-field>
                            <label for="car">{{ translated.CAR }}</label>
                            <md-select v-model="settings.car" required>
                                <md-option value="IONIQ_BEV">{{ translated.IONIQ_BEV }}</md-option>
                                <md-option value="SOUL_EV">{{ translated.SOUL_EV }}</md-option>
                            </md-select>
                        </md-field>
                    </md-list>
                </md-list-item>
                <md-list-item>
                    <md-icon md-src="icons/ev_station.svg"></md-icon>
                    <span class="md-list-item-text">{{ translated.CONSUMPTION }}</span>
                </md-list-item>
                <md-subheader>{{ translated.DEVICES }}</md-subheader>
                <md-list-item md-expand>
                    <md-icon md-src="icons/bluetooth_connected.svg"></md-icon>
                    <span class="md-list-item-text">{{ translated.OBD2_DEVICE }}</span>
                    <md-list slot="md-expand">
                    </md-list>
                </md-list-item>
                <md-list-item>
                    <md-icon md-src="icons/settings_brightness.svg"></md-icon>
                    <span class="md-list-item-text">{{ translated.KEEPAWAKE }}</span>
                    <md-switch v-model="keepawake"></md-switch>
                </md-list-item>
                <md-list-item>
                    <md-icon md-src="icons/launch.svg"></md-icon>
                    <span class="md-list-item-text">{{ translated.AUTOBOOT }}</span>
                    <md-switch v-model="autoboot"></md-switch>
                </md-list-item>
                <md-subheader>{{ translated.NOTIFICATIONS }}</md-subheader>
                <md-list-item md-expand>
                    <md-icon md-src="icons/notifications.svg"></md-icon>
                    <span class="md-list-item-text">{{ translated.NOTIFICATION_TYPES }}</span>
                    <md-list slot="md-expand">
                    </md-list>
                </md-list-item>
                <md-list-item md-expand>
                    <md-icon md-src="icons/notifications_active.svg"></md-icon>
                    <span class="md-list-item-text">{{ translated.NOTIFICATION_THRESHOLD }}</span>
                    <md-list slot="md-expand">
                    </md-list>
                </md-list-item>
                <md-subheader>{{ translated.DEVELOPER_OPTIONS }}</md-subheader>
                <md-list-item>
                    <small>Bug or feature?</small>
                </md-list-item>
            </form>
        </md-list>
        <settings @settingsSaved="saveSettings($event)"></settings>
        <md-snackbar md-position="center" :md-duration="4000" :md-active.sync="showSidebar">
            <span v-if="saved">{{ translated.SETTINGS_SAVED }}</span>
            <span v-if="unexpectedError">{{ translated.UNEXPECTED_ERROR }}</span>
        </md-snackbar>
        <bottom-bar></bottom-bar>
    </div>
</template>

<script>
    import storage from './../modules/storage.vue';
    import translation from './../modules/translation.vue';
    import eventBus from './../modules/event.vue';
    import toolbar from './../container/toolbar.vue';
    import settings from './../container/settings.vue';
    import bottomBar from './../container/bottom-bar.vue';

    export default {
        data() {
            return {
                showSidebar: false,
                saved: false,
                unexpectedError: false,
                translated: {},
                settings: {},
                keepawake: false,
                autoboot: false
            };
        },
        watch: {
            'settings.lng': 'setLng'
        },
        methods: {
            setLng() {
                storage.setValue('lng', this.settings.lng);
                this.translated = translation.translatePage();
                eventBus.$emit('settings_languageChanged');
            },
            saveSettings(settings) {
                var self = this;

                self.unexpectedError = self.saved = false;

                self.$http.put(RESTURL + 'settings', {
                    akey: storage.getValue('akey'),
                    token: storage.getValue('token'),
                    settings
                }).then(response => {
                    storage.setValue('settings', settings);
                    self.showSidebar = self.saved = true;
                }, err => self.showSidebar = self.unexpectedError = true);
            }
        },
        components: {
            toolbar,
            settings,
            bottomBar
        },
        created() {
            this.translated = translation.translatePage();
            this.settings = storage.getValue('settings', this.settings);
        }
    }
</script>