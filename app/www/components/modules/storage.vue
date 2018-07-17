<!-- Module to store and retrieve values within localStorage -->
<script>
    export default {
        /**
         * Saves value for given key within localStorage
         * @param {String} key they key where to store the value in
         * @param {String|Number|Boolean|Object} value the value to store
         * @returns {*} the given value
         */
        setValue: function (key, value) {
            if (key && typeof key === 'string' && value != null && window.localStorage) {
                window.localStorage.setItem(key,
                    ((value != null && typeof value === 'object') ? JSON.stringify(value) : value)
                );
            }
            return value;
        },
        /**
         * Gets value from given key within localStorage
         * @param {String} key the key to retrieve value from
         * @param {*} [defaultValue] optional default value if key does not exists or value isn't set
         * @returns {String|Number|Boolean|Object} the value
         */
        getValue: function (key, defaultValue) {
            var value = '';

            if (key && typeof key === 'string' && window.localStorage) {
                value = window.localStorage.getItem(key);
                // try to detect JSON object or array to return parsed value
                if (typeof value === 'string' && (value.substr(0, 2) === '{"' || value.substr(0, 2) === '[{')) {
                    try {
                        return JSON.parse(value);
                    } catch (error) {}
                }
                if (value) return ((!isNaN(parseFloat(value)) && isFinite(value)) ? parseFloat(value) :
                    ((value === 'true') ? true : ((value === 'false') ? false : value)));
                if (defaultValue) return defaultValue;
                return '';
            }
            return value;
        },
        /**
         * Clears the key and its stored value from localStorage
         * @param {String} key the key to clear and remove its value
         * @returns {String} empty string
         */
        removeValue: function (key) {
            if (key && typeof key === 'string' && window.localStorage) window.localStorage.removeItem(key);
            return '';
        }
    }
</script>