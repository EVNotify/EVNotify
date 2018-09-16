<!-- Snackbar component -->
<template>
    <md-snackbar md-position="center" :md-active="active" :md-persistent="persistent" :md-duration="duration" :class="{
        'snackbar-error': error, 
        'snackbar-warning': warning,
        'snackbar-success': success
    }">
        <span>{{ text }}</span>
    </md-snackbar>
</template>

<script>
    import translation from './translation.vue';

    export default {
        data() {
            return {
                text: '',
                duration: 3000,
                error: false,
                warning: false,
                success: false,
                persistent: true, // current workaround because it's not working within vue material
                active: false
            };
        },
        methods: {
            /**
             * Sets message for the snackbar components and automatically handles duration
             * @param {String} text the text to set
             * @param {Boolean} persistent whether or not message should be persistent - if not, it will be displayed for 3 seconds
             * @param {String} type the type of message (warning, error or success) - if not set, default type will be used
             * @returns {Object} returns this
             */
            setMessage(text, persistent, type) {
                this.text = translation.translate(text);
                this.active = true;
                this.duration = ((persistent) ? Infinity : 3000);
                if (!persistent) {
                    // manually hide snackbar again because it's not working good within vue material
                    setTimeout(() => {
                        this.active = (this.duration === Infinity);
                    }, 3000);
                }
                // css classes handling
                this.error = (type === 'error');
                this.warning = (type === 'warning');
                this.success = (type === 'success');
                return this;
            },
            /**
             * Forces show of the snackbar
             * @returns {Object} returns this
             */
            show() {
                this.active = true;
                return this;
            },
            /**
             * Forces hide of the snackbar
             * @returns {Object} returns this
             */
            hide() {
                this.active = false;
                return this;
            }
        }
    }
</script>

<style scoped>
    .md-snackbar {
        font-weight: bold;
    }

    .md-snackbar .md-snackbar-content span {
        text-align: center;
        width: 100%;
    }

    .snackbar-error {
        background-color: #a92121;
    }

    .snackbar-warning {
        background-color: #e06f39;
    }

    .snackbar-success {
        background-color: #329421;
    }
</style>