<!-- The registration page -->
<template>
    <div>
        <md-steppers :md-active-step.sync="active" md-linear>
            <md-step id="first" :md-label="translated.INTRODUCTION" :md-done.sync="first" :md-editable="false">
                <p>{{ translated.INTRODUCTION_TEXT_1 }}</p>
                <p>{{ translated.INTRODUCTION_TEXT_2 }}</p>
                <p>{{ translated.INTRODUCTION_TEXT_3 }}</p>
                <p>{{ translated.INTRODUCTION_TEXT_4 }}</p>
                <p>
                    <b>{{ translated.OWN_RISK }}</b>
                </p>
                <md-button class="md-raised md-primary" @click="setDone('first', 'second')">{{ translated.PROCEED }}</md-button>
            </md-step>

            <md-step id="second" :md-label="translated.CREATE_ACCOUNT" :md-error="secondStepError" :md-done.sync="second" :md-editable="false">
                <p>{{ translated.CREATE_ACCOUNT_TEXT_1 }}</p>
                <p>{{ translated.CREATE_ACCOUNT_TEXT_2 }}
                    <a :href="translated.PRIVACY_URL">{{ translated.PRIVACY_URL }}</a>
                </p>
                <form class="form">
                    <md-field>
                        <label>{{ translated.PASSWORD }}</label>
                        <md-input v-model="password" type="password" v-on:input="secondStepError=''; comparePasswords()" required></md-input>
                        <span class="input-field-error" v-if="(secondStepError && !password) || (secondStepError && password.length < 6)">{{ translated.CHECK_PASSWORD }}</span>
                    </md-field>
                    <md-field>
                        <label>{{ translated.PASSWORD_REPEAT }}</label>
                        <md-input v-model="passwordRepeat" type="password" v-on:input="secondStepError=''; comparePasswords()" required></md-input>
                        <span class="input-field-error" v-if="!passwordMatches">{{ translated.PASSWORD_MISMATCH }}</span>
                        <span class="input-field-error" v-if="secondStepError && !passwordRepeat && password">{{ translated.CHECK_PASSWORD }}</span>
                    </md-field>
                </form>
                <md-button class="md-raised md-primary" @click="setDone('second', 'third')">{{ translated.PROCEED }}</md-button>
            </md-step>

            <md-step id="third" :md-label="translated.SETUP" :md-error="thirdStepError" :md-done.sync="third" :md-editable="false">
                <settings @settingsSaved="settingsObj = $event; setDone('third')" @languageChanged="translatePage();"></settings>
            </md-step>
        </md-steppers>
    </div>
</template>

<script>
    import translation from './../modules/translation.vue';
    import storage from './../modules/storage.vue';
    import settings from './../container/settings.vue';
    import eventBus from './../modules/event.vue';

    export default {
        data() {
            return {
                active: 'first',
                first: false,
                second: false,
                third: false,
                secondStepError: '',
                thirdStepError: '',
                translated: {},
                password: '',
                passwordRepeat: '',
                akey: '',
                passwordMatches: true,
                settingsObj: {}
            }
        },
        components: {
            translation,
            storage,
            settings,
            eventBus
        },
        methods: {
            setDone(id, index) {
                var self = this,
                    nextPage = () => {
                        if (index) self.active = index; // call the next step
                    };

                self.secondStepError = self.thirdStepError = null;

                // if on second step we need to create a new account
                if (id === 'second') {
                    if (!self.password || self.password.length < 6 || !self.passwordRepeat ||
                        self.passwordRepeat.length < 6 || !self.comparePasswords()) {
                        return self.secondStepError = translation.translate('CHECK_INPUTS');
                    }
                    // get an available key
                    self.$http.get(RESTURL + 'key', {}).then(response => {
                        if (response.body.akey) {
                            self.akey = response.body.akey;
                            // register account with password
                            self.$http.post(RESTURL + 'register', {
                                akey: self.akey,
                                password: self.password
                            }).then(response => {
                                if (response.body.token) {
                                    storage.setValue('akey', self.akey);
                                    storage.setValue('token', response.body.token);
                                    self[id] = true; // mark the current step as valid
                                    eventBus.$emit('settings_getSettings', true);
                                    nextPage();
                                } else self.secondStepError = translation.translate('UNEXPECTED_ERROR');
                            }, err => self.secondStepError = translation.translate('UNEXPECTED_ERROR'));
                        } else self.secondStepError = translation.translate('UNEXPECTED_ERROR');
                    }, err => self.secondStepError = translation.translate('UNEXPECTED_ERROR'));
                } else if (id === 'third') {
                    // update the settings
                    self.$http.put(RESTURL + 'settings', {
                        settings: self.settingsObj,
                        akey: storage.getValue('akey'),
                        token: storage.getValue('token')
                    }).then(response => {
                        self.$router.push('/dashboard');
                    }, err => self.thirdStepError = translation.translate('UNEXPECTED_ERROR'));
                } else {
                    self[id] = true; // mark the current step as valid
                    nextPage();
                }
            },
            comparePasswords() {
                if (this.password && this.passwordRepeat) return this.passwordMatches = (this.password === this.passwordRepeat);

                return this.passwordMatches = true;
            },
            translatePage() {
                this.translated = translation.translatePage();
            }
        },
        created() {
            this.translatePage();
        }
    }
</script>