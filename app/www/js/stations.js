/**
 * stations handler
 */

/**
 * Function which retrieves list of charging points based on position and radius
 * @param  {Object}   positonObj    Position object containing latitude and longitude information
 * @param  {Integer}   radius       the radius to limit the results (in kilometres)
 * @param  {Function} callback      callback function
 * @return {void}
 */
function getStations(positonObj, radius, callback) {
    // build the dataObj
    var dataObj = {
        lat: positonObj.latitude,
        lng: positonObj.longitude,
        radius: radius
    };

    sendRequest('getstations', dataObj, function(err, stationRes) {
        callback(err, stationRes);
    });
}

/**
 * Function which builds the stations list retrieved from getStations()
 * @return {void}
 */
function buildStations() {
    /**
     * Function which shows message on the snackbar
     * @param  {String} text The text to show
     * @return {void}
     */
    var showMessage = function(text) {
        var infoMessage = $('#infoMessage')[0].MaterialSnackbar.showSnackbar({
            message: text,
            duration: 2222
        });
    },
    lng = getValue('lng', 'en');

    showMessage(translate('FETCHING_STATIONS', lng));
    // retrieve the current location
    getCurrentLocation(function(err, positionObj) {
        if(!err && positionObj && positionObj.coords) {
            // get the stations
            getStations(positionObj.coords, 10, function(err, stationRes) {
                if(!err && stationRes && stationRes.stations && stationRes.stations.chargelocations instanceof Array) {
                    var list = document.getElementById('stationsList');

                    // clean up list
                    while (list.hasChildNodes()) list.removeChild(list.lastChild);
                    stationRes.stations.chargelocations.forEach(function(stationObj) {
                        if (stationObj instanceof Object) buildStationRow(stationObj);
                    });
                } else showMessage(translate('STATIONS_ERROR', lng));
            });
        } else showMessage(translate('POSITION_ERROR', lng));
    });
}

/**
 * Function which retrieves current location
 * @return {void}
 */
function getCurrentLocation(callback) {
    if(typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(positionObj) {
            callback(null, positionObj);
        }, function(err) {
            callback(err, null);
        }, {enableHighAccuracy: true});
    }
}

/**
 * Function which builds the station row with all required information and appends it to the list
 * @param  {Object} stationObj  the station object to display
 * @return {void}
 */
function buildStationRow(stationObj) {
    var list = document.getElementById('stationsList'),
        row = document.createElement('li'),
        spanPrimary = document.createElement('span'),
        /**
         * Function which creates the content for the primary span
         * @return {Node}   returns generated content node
         */
        createPrimaryContent = function() {
            var img = document.createElement('img'),
                name = document.createElement('span'),
                address = document.createElement('span'),
                chargepoints = document.createElement('i');

            // apply required classNames and references
            img.className = 'material-icons mdl-list__item-avatar ' + ((stationObj.fault_report)? 'fault' : 'operational'); // TODO slow detection
            name.innerHTML = stationObj.name;
            address.className = 'mdl-list__item-text-body station-address';
            address.innerHTML = ((stationObj.address)?
                                    stationObj.address.postcode + ' ' +
                                    stationObj.address.city + ' (' +
                                    stationObj.address.country + ')<br> ' +
                                    stationObj.address.street + '<br>' : '?');
            chargepoints.className = 'station-connectors';
            chargepoints.innerHTML = ((stationObj.chargepoints)?
                                        stationObj.chargepoints.map(function(chargeObj) {
                                            return chargeObj.count + 'x' +
                                                chargeObj.type + ' ' +
                                                chargeObj.power + 'kW';
                                            }).toString() : '?')
            // return generated node
            spanPrimary.appendChild(img);
            spanPrimary.appendChild(name);
            spanPrimary.appendChild(address);
            address.appendChild(chargepoints);
            return spanPrimary;
        },
        spanSecondary = document.createElement('span'),
        /**
         * Function which creates the content for the secondary span
         * @return {Node}   returns generated content node
         */
        createSecondaryContent = function() {
            var a = document.createElement('a'),
                a2 = document.createElement('a'),
                img = document.createElement('img'),
                img2 = document.createElement('img');

            // apply required classNames and references
            a.className = 'mdl-list__item-secondary-action';
            img.className = 'material-icons';
            img.src = './icons/star.svg';
            img.onclick = function(e) {
                // TODO: favorite function handling
                this.src = ((this.src.indexOf('star_full') !== -1)? './icons/star.svg' : './icons/star_full.svg');
                e.stopPropagation();
            }
            if(stationObj.verified) {
                a2.className = 'mdl-list__item-secondary-action';
                img2.className = 'material-icons';
                img2.src = './icons/verified.svg';
                spanSecondary.appendChild(a2);
                spanSecondary.appendChild(img2);
            }
            // return generated node
            spanSecondary.appendChild(a);
            spanSecondary.appendChild(img);
            return spanSecondary;
        };

    // build row element with all required children, class lists and information
    row.className = 'mdl-list__item mdl-list__item--three-line';
    spanPrimary.className = 'mdl-list__item-primary-content';
    spanSecondary.className = 'mdl-list__item-secondary-content';
    row.appendChild(createPrimaryContent());
    row.appendChild(createSecondaryContent());
    row.stationObj = stationObj;
    row.onclick = function() {
        // TODO: station details page handling
        console.log(this.stationObj);
    };
    list.appendChild(row);
}
