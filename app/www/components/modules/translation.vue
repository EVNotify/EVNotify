<!-- Module to translate keys to it's corresponding local translation (set language or user preferred language) -->
<script>
import storage from './storage.vue';
import de from './../../lng/de.js';
import en from './../../lng/en.js';

export default {
    /**
     * Translates given key into it's local translation (either from set language or user preferred language)
     * @returns {String} the translated string
     */
    translate: function(key) {
        var lng = storage.getValue('lng', (navigator.language || navigator.userLanguage));

        if(typeof lng === 'string') {
            if(lng.toUpperCase().indexOf('DE') !== -1) return de[key] || '';
            return en[key] || '';
        }
        return '';
    }
}
</script>
