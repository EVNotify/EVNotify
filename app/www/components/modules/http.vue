<!-- HTTP Module to send and handle HTTP requests -->
<script>
    import EventBus from './event.vue';

    export default {
        /**
         * Sends HTTP request for given HTTP method for specific function with given parameters
         * @param {String} method the HTTP method to use for this request
         * @param {String} fnc the function to call on the backend
         * @param {Object} params the params to send
         * @param {Boolean} loadingIndicator whether or not a loading indicator should be visible
         * @param {Function} callback callback function
         * @param {Number} [timeout] the timeout for the request
         */
        sendRequest(method, fnc, params, loadingIndicator, callback, timeout) {
            var allowedMethods = ['get', 'post', 'put', 'delete'];

            method = ((typeof method === 'string') ? method.toLowerCase() : '');

            if (allowedMethods.includes(method)) {
                var third = null;
                if (typeof fnc !== 'string') fnc = '';
                if (params == null || typeof params !== 'object') params = {}; // ensure that it is a valid object
                if (timeout == null || typeof timeout !== 'number') timeout = 0;
                if (method === 'get') {
                    params = {
                        params,
                        timeout,
                    }; // special handling for GET requests
                } else if (method === 'delete') {
                    params = {
                        body: params,
                        timeout,
                    }; // special handling for DELETE requests
                } else {
                    third = {
                        timeout,
                    };
                }
                if (loadingIndicator) EventBus.$emit('loading', true);
                Vue.http[method](RESTURL + fnc, params, third).then(response => {
                    EventBus.$emit('loading', false);
                    if (typeof callback === 'function') callback(null, response.body || response);
                }, err => {
                    if (loadingIndicator) EventBus.$emit('loading', false);
                    // global events for critical errors
                    if (err) {
                        switch(err.status) {
                        case 0:
                            EventBus.$emit('timeout');
                            break;
                        case 401:
                            EventBus.$emit('unauthorized');
                            break;
                        case 500:
                            EventBus.$emit('internalerror');
                            break;
                        }
                    }
                    if (typeof callback === 'function') callback(err);
                });
            } else if (typeof callback === 'function') callback(405);
        }
    }
</script>