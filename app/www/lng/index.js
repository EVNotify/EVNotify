/**
 * Function which translate given text into the specified language
 * @param  {String} text The text to translate
 * @param  {String} lng  The language in which the text should be translated
 * @return {String}      The translated text or the untranslated text if translation not found
 */
function translate(text, lng) {
    return ((lng && typeof window[lng] !== 'undefined' && typeof window[lng][text] !== 'undefined')? window[lng][text] : text);
}

/**
 * Function which determines if text is a valid translatable text (uppercase check, string check and id check)
 * @param  {String}  text The text to validate
 * @return {Boolean}      whether or not the text meets the requirements to be a translatable text
 */
function isTranslatable(text) {
    return (text === text.toUpperCase() && !parseInt(text) && document.getElementById(text));
}

/**
 * Function which translates all translatable text on current page in the specified language
 * @param  {String} lng the language in which the page should be translated
 */
function translatePage(lng) {
    for (var translation in document.getElementsByClassName('translate')) {
        if(isTranslatable(translation)) document.getElementById(translation).innerText = translate(translation, lng);
    }
}
