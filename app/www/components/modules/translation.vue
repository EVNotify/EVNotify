<!-- Module to translate keys to it's corresponding local translation (set language or user preferred language) -->
<script>
import storage from './storage.vue';
import de from './../../lng/de.js';
import en from './../../lng/en.js';

export default {
    /**
     * Gets the current set local language or gets the default user preferred browser language
     * @returns {String} the local lng (either 'de' or 'en')
     */
    getLocalLng: () => {
        var lng = storage.getValue('lng', (navigator.language || navigator.userLanguage));

        if(typeof lng === 'string' && lng.toLowerCase().indexOf('de') !== -1) return 'de';

        return 'en';
    },
    /**
     * Translates given key into it's local translation (either from set language or user preferred language)
     * @returns {String} the translated string
     */
    translate(key) {
        if (typeof key !== 'string') return '';
        if(this.getLocalLng() === 'de') return de[key] || key;
        return en[key] || key;
    },
    /**
     * Translates each key from language and returns translated object
     */
    translatePage() {
        var translated = {};
        
        Object.keys(de).forEach(key => translated[key] = this.translate(key));
        return translated;
    }
}
</script>
