<!-- The login page -->
<template>
    <div id="login" class="centered-container">
        <md-content class="md-elevation-3">
            <div class="title">
                <img src="img/logo.png">
                <div class="md-title">EVNotify</div>
                <div class="md-body-1">{{ translated.SLOGAN }}</div>
                <div class="md-body-1 error-message" v-if="unexpectedError">{{ translated.UNEXPECTED_ERROR }}</div>
                <div class="md-body-1 error-message" v-if="invalidCredentials">{{ translated.INVALID_CREDENTIALS }}</div>
            </div>
            <form class="form">
                <md-field>
                    <label>AKey</label>
                    <md-input v-model="akey" autofocus v-on:input="invalidCredentials=false" required></md-input>
                </md-field>
                <md-field md-has-password>
                    <label>{{ translated.PASSWORD }}</label>
                    <md-input v-model="password" type="password" v-on:input="invalidCredentials=false" required></md-input>
                </md-field>
            </form>
            <div class="actions md-layout md-alignment-center-space-between">
                <router-link to="/register">{{ translated.CREATE_ACCOUNT }}</router-link>
            </div>
            <div class="actions md-layout md-alignment-center-space-between">
                <router-link to="/passwordForgot">{{ translated.PASSWORD_FORGOT }}</router-link>
                <md-button class="md-raised md-primary" @click="login" id="loginBtn">{{ translated.LOGIN }}</md-button>
            </div>
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
                unexpectedError: false
            };
        },
        components: {
            translation,
            storage,
            settings
        },
        methods: {
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
        created() {
            var self = this;

            // determine if we are already logged in - if so, skip login page
            if (storage.getValue('token') && storage.getValue('akey')) return self.$router.push('/dashboard');

            // translate all labels in correct language
            self.translated = translation.translatePage();
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