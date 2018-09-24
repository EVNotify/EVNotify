<!-- HTTP Module to send and handle HTTP requests -->
<script>
    import EventBus from './event.vue';

    export default {
        /**
         * Sends HTTP request for given HTTP method for specific function with given parameters
         * @param {String} method the HTTP method to use for this request
         * @param {String} fnc the function to call on the backend
         * @param {Object} params the params to send
         * @param {Function} callback callback function
         */
        sendRequest(method, fnc, params, callback) {
            var allowedMethods = ['get', 'post', 'put', 'delete'];

            method = ((typeof method === 'string') ? method.toLowerCase() : '');

            if (allowedMethods.includes(method)) {
                if (typeof fnc !== 'string') fnc = '';
                if (params == null || typeof params !== 'object') params = {}; // ensure that it is a valid object
                if (method === 'get') {
                    params = {
                        params
                    }; // special handling for GET requests
                }
                Vue.http[method](RESTURL + fnc, params).then(response => {
                    if (typeof callback === 'function') callback(null, response.body || response);
                }, err => {
                    // global events for critical errors
                    if (err && err.status === 401) EventBus.$emit('unauthorized');
                    else if (err && err.status === 500) EventBus.$emit('internalerror');
                    if (typeof callback === 'function') callback(err);
                });
            } else if (typeof callback === 'function') callback(405);
        }
    }
</script>