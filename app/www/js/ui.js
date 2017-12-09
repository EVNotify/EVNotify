/**
 * @file        ui.js
 * @description This contains several helper functions for the UI
 */

/**
 * Enables or disables dark mode and handles styling for given page
 * @param  {Boolean} enable whether or not dark mode shpuld be enabled
 * @param  {String} page    the page (specific handling)
 * @return {void}
 */
function darkMode(enable, page) {
    // validate paramaters
    if(typeof enable !== 'boolean' || typeof page !== 'string') return;

    var pageContent = document.getElementById('pageContent');

    if(pageContent) {
        // switch handling for pages
        if(page === 'index') {
            pageContent.className = 'mdl-layout__content' + ((enable)? ' dark' : '');
            document.getElementById('consumption_settings_icon').src = './icons/settings' + ((enable)? '_light' : '') + '.svg';
            document.getElementById('timestamp_icon').src = './icons/last_update' + ((enable)? '_light' : '') + '.svg';
            document.getElementById('range_icon').src = './icons/ev_station' + ((enable)? '_light' : '') + '.svg';
            document.getElementById('duration_icon').src = './icons/clock' + ((enable)? '_light' : '') + '.svg';
        }
    }
}
