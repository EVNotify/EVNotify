<!-- The registration page -->
<template>
    <div>
        <md-steppers :md-active-step.sync="active" md-linear>
            <md-step id="first" :md-label="translated.INTRODUCTION" :md-done.sync="first">
                <p>{{ translated.INTRODUCTION_TEXT_1 }}</p>
                <p>{{ translated.INTRODUCTION_TEXT_2 }}</p>
                <p>{{ translated.INTRODUCTION_TEXT_3 }}</p>
                <p>{{ translated.INTRODUCTION_TEXT_4 }}</p>
                <p>
                    <b>{{ translated.OWN_RISK }}</b>
                </p>
                <md-button class="md-raised md-primary" @click="setDone('first', 'second')">{{ translated.PROCEED }}</md-button>
            </md-step>

            <md-step id="second" :md-label="translated.CREATE_ACCOUNT" :md-error="secondStepError" :md-done.sync="second">
                <p>{{ translated.CREATE_ACCOUNT_TEXT_1 }}</p>
                <p>{{ translated.CREATE_ACCOUNT_TEXT_2 }}
                    <a :href="translated.PRIVACY_URL">{{ translated.PRIVACY_URL }}</a>
                </p>
                <form class="form">
                    <md-field>
                        <label>{{ translated.PASSWORD }}</label>
                        <md-input v-model="password" type="password" v-on:input="secondStepError=''; comparePasswords()" required></md-input>
                    </md-field>
                    <md-field>
                        <label>{{ translated.PASSWORD_REPEAT }}</label>
                        <md-input v-model="passwordRepeat" type="password" v-on:input="secondStepError=''; comparePasswords()" required></md-input>
                        <span class="input-field-error" v-if="!passwordMatches">{{ translated.PASSWORD_MISMATCH }}</span>
                    </md-field>
                </form>
                <md-button class="md-raised md-primary" @click="setDone('second', 'third')">{{ translated.PROCEED }}</md-button>
            </md-step>

            <md-step id="third" :md-label="translated.SETUP" :md-error="thirdStepError" :md-done.sync="third">
                <md-button class="md-raised md-primary" @click="setDone('third')">{{ translated.DONE }}</md-button>
            </md-step>
        </md-steppers>
    </div>
</template>

<script>
    import translation from './../modules/translation.vue';

    export default {
        data: function () {
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
                passwordMatches: true
            }
        },
        methods: {
            setDone: function (id, index) {
                this[id] = true

                this.secondStepError = null

                if (index) {
                    this.active = index
                }
            },
            comparePasswords: function() {
                if(this.password && this.passwordRepeat) return this.passwordMatches = (this.password === this.passwordRepeat); 

                return this.passwordMatches = true;
            }
        },
        created: function () {
            var self = this,
                toTranslate = [
                    'INTRODUCTION', 'CREATE_ACCOUNT', 'SETUP', 'PROCEED', 'OWN_RISK', 'DONE',
                    'INTRODUCTION_TEXT_1', 'INTRODUCTION_TEXT_2', 'INTRODUCTION_TEXT_3', 'INTRODUCTION_TEXT_4',
                    'CREATE_ACCOUNT_TEXT_1', 'CREATE_ACCOUNT_TEXT_2', 'PRIVACY_URL', 'PASSWORD', 'PASSWORD_REPEAT', 'PASSWORD_MISMATCH'
                ];

            // translate all labels in correct language
            toTranslate.forEach(function (key) {
                self.translated[key] = translation.translate(key);
            });
        }
    }
</script>