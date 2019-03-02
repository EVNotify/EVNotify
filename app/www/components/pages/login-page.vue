<!-- The login page -->
<template>
    <div id="login" class="centered-container">
        <md-content class="md-elevation-3">
            <v-tour name="login-tour" :steps="steps" :callbacks="tourCallbacks"></v-tour>
            <div class="title">
                <img src="img/logo.png">
                <div class="md-title v-step-1">EVNotify</div>
                <div class="md-body-1">{{ translated.SLOGAN }}</div>
                <div class="md-body-1 error-message" v-if="unexpectedError">{{ translated.UNEXPECTED_ERROR }}</div>
                <div class="md-body-1 error-message" v-if="invalidCredentials">{{ translated.INVALID_CREDENTIALS }}</div>
            </div>
            <form class="form v-step-3">
                <md-field>
                    <label>AKey</label>
                    <md-input v-model="akey" autofocus v-on:input="invalidCredentials=false" required></md-input>
                    <span class="md-helper-text">{{ translated.V1_MIGRATION_NOTE }}</span>
                </md-field>
                <br>
                <md-field md-has-password>
                    <label>{{ translated.PASSWORD }}</label>
                    <md-input v-model="password" type="password" v-on:input="invalidCredentials=false" required></md-input>
                </md-field>
            </form>
            <div class="actions md-layout md-alignment-center-space-between v-step-2" style="float: left">
                <router-link to="/register">{{ translated.CREATE_ACCOUNT }}</router-link>
            </div>
            <div class="actions md-layout md-alignment-center-space-between" style="float: right">
                <!-- TODO -->
                <!-- <router-link to="/passwordForgot">{{ translated.PASSWORD_FORGOT }}</router-link> -->
                <md-button class="md-raised md-primary" @click="login" id="loginBtn">{{ translated.LOGIN }}</md-button>
            </div>
            <br><br><br>
            <small class="md-layout md-alignment-center" @click="setLng()">{{ translated.CHANGE_LANGUAGE }}</small>
        </md-content>
        <div class="background"></div>
        <transition name="fade">
            <router-view></router-view>
        </transition>
    </div>
</template>

<script>
    import http from './../modules/http.vue';
    import translation from './../modules/translation.vue';
    import settings from './../container/settings.vue';
    import storage from './../modules/storage.vue';
    import eventBus from './../modules/event.vue';

    export default {
        data() {
            return {
                akey: '',
                invalidCredentials: false,
                password: '',
                translated: {},
                unexpectedError: false,
                steps: [{
                    target: '.v-step-1',
                    originalContent: 'TOUR_LOGIN_1',
                    content: 'TOUR_LOGIN_1'
                }, {
                    target: '.v-step-2',
                    originalContent: 'TOUR_LOGIN_2',
                    content: 'TOUR_LOGIN_2'
                }, {
                    target: '.v-step-3',
                    originalContent: 'TOUR_LOGIN_3',
                    content: 'TOUR_LOGIN_3'
                }],
                tourCallbacks: {
                    onStop: () => {
                        storage.setValue('tour_completed_login', true);
                    }
                }
            };
        },
        components: {
            translation,
            storage,
            settings
        },
        methods: {
            setLng() {
                var self = this;
                var currentLng = storage.getValue('lng', translation.getLocalLng());

                storage.setValue('lng', ((currentLng === 'de') ? 'en' : 'de'));
                self.translated = translation.translatePage();
                // translate tour
                self.steps = self.steps.map(step => {
                    step.content = translation.translate(step.originalContent);
                    return step;
                });
                eventBus.$emit('settings_languageChanged');
            },
            login() {
                var self = this;

                http.sendRequest('POST', 'login', {
                    akey: self.akey,
                    password: self.password
                }, true, (err, res) => {
                    if (!err && res) {
                        if (res.token) {
                            // push notifications handling
                            if (window.cordova && window.FCMPlugin) {
                                // check if there was another token linked before
                                if (storage.getValue('token')) FCMPlugin.unsubscribeFromTopic(storage.getValue('token'));
                                // subscribe to own messages
                                FCMPlugin.subscribeToTopic(res.token);
                            }
                            // save akey and token
                            storage.setValue('akey', self.akey);
                            storage.setValue('token', res.token);
                            // retrieve and set the settings from account
                            http.sendRequest('GET', 'settings', {
                                akey: storage.getValue('akey'),
                                token: storage.getValue('token')
                            }, true, (err, res) => {
                                if (!err && res) {
                                    if (res.settings != null) {
                                        storage.setValue('settings', res.settings);
                                        storage.setValue('lng', res.settings.lng);
                                        self.$router.push('/dashboard');
                                    } else self.unexpectedError = true;
                                } else self.unexpectedError = true;
                            });
                        } else self.unexpectedError = true;
                    } else {
                        // TODO check error code?
                        self.invalidCredentials = true;
                    }
                });
            }
        },
        mounted() {
            var self = this;

            // determine if we are already logged in - if so, skip login page
            if (storage.getValue('token') && storage.getValue('akey')) {
                // enable user tracking
                if (typeof Rollbar !== 'undefined') {
                    Rollbar.configure({
                        payload: {
                            person: {
                                id: storage.getValue('akey')
                            }
                        }
                    });
                }
                return self.$router.push('/dashboard');
            }

            // translate all labels in correct language
            self.translated = translation.translatePage();
            // start the tour
            if (!storage.getValue('tour_completed_login')) {
                // translate the tour and start afterwards
                self.steps.forEach(step => step.content = translation.translate(step.content));
                self.$tours['login-tour'].start();
            }
            // apply backbuttonPressed listener to handle exit or back
            eventBus.$off('backbuttonPressed');
            eventBus.$on('backbuttonPressed', function(e) {
                if (self.$route.path === '/') {
                    e.preventDefault();
                    navigator.app.exitApp();
                }
            });
        }
    };
</script>