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
 * Function which builds the stations list retrieved from getStations() and also fetches and sets the available chargings cards
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
    // retrieve and save station cards
    retrieveStationCards(function(err, cardsRes) {
        if(!err && cardsRes) {
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
        } else showMessage(translate('CARDS_ERROR', lng));
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
        // show station details
        document.location.href = './station.html?id=' + this.stationObj.ge_id;
    };
    list.appendChild(row);
}

/**
 * Function which extracts station id from url
 * @return {Integer}    the extracted id
 */
function getStationIDFromURL() {
    return parseInt(decodeURIComponent((new RegExp('[?|&]id=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null);
}

/**
 * Function which retrieves details from specific station extracted from url
 * @param  {Function} callback  callback function
 * @return {void}
 */
function getStation(callback) {
    var id = getStationIDFromURL();

    if(typeof id === 'number') {
        // get station details
        sendRequest('getstation', {id: id}, function(err, stationRes) {
            callback(err, stationRes);
        });
    } else callback('invalid id', null);
}

/**
 * Function which builds station details from station details fetched from getStation()
 * @return {void}
 */
function buildStation() {
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

    showMessage(translate('FETCHING_STATION', lng));

    // get station from url and retrieve the station details
    getStation(function(err, stationRes) {
        if(!err && stationRes && stationRes.station && stationRes.station.chargelocations instanceof Array) {
            buildStationPages(stationRes.station.chargelocations[0], lng);
        } else showMessage(translate('STATION_ERROR', lng));
    });
}

/**
 * Function which builds all the station pages based on given station object
 * @param  {Object} stationObj  the station object containing the station all the details
 * @param  {String} lng         the language to use
 * @return {void}
 */
function buildStationPages(stationObj, lng) {
    if(stationObj instanceof Object) {
        var stationList = document.getElementById('stationList'),
            /**
             * Function which builds photo details for station (asynchronously)
             * @param  {Array}   photos     Array of photo objects containing the photo id to retrieve
             * @param  {Function} callback  callback function
             * @return {void}
             */
            displayPhoto = function(photos, callback) {
                if(photos instanceof Array) {
                    // NOTE: Currently only the first one will be displayed! //TODO support all with navigation
                    if(photos[0] instanceof Object) {
                        // retrieve image binary data via XMLHttpRequest
                        retrieveStationPhoto(photos[0].id, function(err, photoRes) {
                            callback(err, photoRes);
                        });
                    } else callback(true, null);
                } else callback(true, null);
            },
            /**
             * Function which returns address details for station
             * @param  {Object} addressObj  the address object containing all the address information
             * @return {String}             the generated html
             */
            displayAddress = function(addressObj) {
                if(addressObj instanceof Object) {
                    return '<li>' + stationObj.address.street + '</li><li>' + stationObj.address.postcode + ' ' + stationObj.address.city + '</li>' +
                    '<li>' + stationObj.address.country + '</li>'
                }
                return '';
            },
            /**
             * Function which returns chargepoints details for station
             * @param  {Array} chargepoints Array of chargepoints objects
             * @return {String}             the generated html
             */
            displayChargePoints = function(chargepoints) {
                var retval = '';

                if(chargepoints instanceof Array) {
                    chargepoints.forEach(function(chargePoint) {
                        retval += '<li>' + chargePoint.count + 'x' + chargePoint.power + 'kW ' + chargePoint.type + '</li>';
                    });
                }
                return retval;
            },
            /**
             * Function which returns status details for station
             * @param  {Object} statusObj   the status object containg status information about station
             * @return {String}             the generated html
             */
            displayStatus = function(statusObj) {
                return '<li style=\'color: ' + ((statusObj.fault)? 'red' : 'green') + '\'>' + translate(((statusObj.fault)? 'STATION_FAULT' : 'STATION_OPERATIONAL'), lng) + '</li>' +
                    '<li style=\'color: ' + ((statusObj.verified)? 'green' : 'grey') + '\'>' + translate(((statusObj.verified)? 'STATION_VERIFIED' : 'STATION_NOT_VERIFIED'), lng) + '</li>' +
                    '<li style=\'color: ' + ((statusObj.barrierfree)? 'green' : 'grey') + '\'>' + translate(((statusObj.barrierfree)? 'STATION_BARRIERFREE' : 'STATION_NOT_BARRIERFREE'), lng) + '</li>'
            },
            /**
             * Function which returns charge cards details for station based on previously saved stationcards in localStorage
             * @param  {Array} cards    Array containing ids of the charge cards
             * @return {String}         the generated html
             */
            displayCards = function(cards) {
                var retval = '',
                    allCards = JSON.parse(getValue('stationcards', '[]'));

                if(cards instanceof Array && allCards instanceof Array) {
                    cards.forEach(function(cardObj) {
                        // try to get corresponding full card object reference
                        try {
                            var foundCardObj = JSON.parse(getValue('stationcards')).filter(function(fullCardObj) { return fullCardObj.card_id === cardObj.id})[0];

                            if(foundCardObj instanceof Object && foundCardObj.name) {
                                retval += '<li>' + foundCardObj.name + '</li>';
                            }
                        } catch (e) {}
                    });
                }

                return retval || translate('STATION_NO_INFORMATION', lng);
            },
            /**
             * Function which returns information for station
             * @param  {Object} stationObj  the station object containg the general information
             * @return {String}             the generated html
             */
            displayInformation = function(stationObj) {
                var retval = '';

                if(stationObj.network) retval += '<li>' + translate('STATION_NETWORK', lng) + ': ' + stationObj.network + '</li>';
                if(stationObj.operator) retval += '<li>' + translate('STATION_OPERATOR', lng) + ': ' + stationObj.operator + '</li>';
                if(stationObj.ladeweile) retval += '<li>' + translate('STATION_CHARGING_TIME', lng) + ': ' + stationObj.ladeweile + '</li>';
                if(stationObj.location_description) retval += '<li>' + translate('STATION_LOCATION', lng) + ': ' + stationObj.location_description + '</li>';
                if(stationObj.general_information) retval += '<li>' + translate('STATION_INFORMATION', lng) + ': ' + stationObj.general_information + '</li>';

                return retval || translate('STATION_NO_INFORMATION', lng);
            },
            /**
             * Function which returns the costs for station
             * @param  {Object} costObj Object containg information for the costs
             * @return {String}         the generated html
             */
            displayCosts = function(costObj) {
                var retval = '';

                if(costObj instanceof Object) {
                    retval += '<li>' + translate('STATION_FREE_CHARGING', lng) + ': ' + translate(((stationObj.freecharging)?  'YES' : 'NO'), lng) + '</li>';
                    retval += '<li>' + translate('STATION_FREE_PARKING', lng) + ': ' + translate(((stationObj.freeparking)?  'YES' : 'NO'), lng) + '</li>';
                    if(costObj.description_short) retval += '<li>' + costObj.description_short + '</li>';
                    if(costObj.description_long) retval += '<li>' + costObj.description_long + '</li>';
                }

                return retval || translate('STATION_NO_INFORMATION', lng);
            },
            /**
             * Function which builds and returns the opening times for station
             * @param  {Oject} openingObj   Object containg all the neccessary information about the opening times for the station
             * @return {String}             the generated html
             */
            displayOpeningTime = function(openingObj) {
                var retval = '',
                    convertOpeningTime = function(openingStr) {
                        try {
                            // find the corresponding from/till values and format them
                            return openingStr.match(/\d+/g).map(function(part, partIdx) {
                                return ((partIdx === 1 || partIdx === 3)? ':' : '') + part + ((partIdx === 1)? ' - ' : '');
                            }).join('');
                        } catch (e) {
                            return '-';
                        }
                    };

                if(openingObj instanceof Object) {
                    // check when opened
                    if(openingObj['24/7']) retval += '<li>24/7</li>';
                    else if(openingObj.days instanceof Object){
                        // build day list
                        for(var weekday in openingObj.days) {
                            retval += '<li>' + translate(weekday.toUpperCase(), lng) + ': ' + convertOpeningTime(openingObj.days[weekday]) + '</li>';
                        }
                    }
                    // apply description if any
                    if(openingObj.description) retval += '<li>' + openingObj.description + '</li>';
                }

                return retval || translate('STATION_NO_INFORMATION', lng);
            };

        // attach reference to stationList
        stationList.stationObj = stationObj;

        // iterate through the tabs
        for (var i = 0; i < 3; i++) {
            // apply name
            document.getElementById('station_title_' + (i + 1)).innerText = stationObj.name || '';
        }
        // apply address
        document.getElementById('station_address').innerHTML = displayAddress(stationObj.address);
        // apply connectors
        document.getElementById('station_connectors').innerHTML = displayChargePoints(stationObj.chargepoints);
        // apply status
        document.getElementById('station_status').innerHTML = displayStatus({
            fault: stationObj.fault_report,
            verified: stationObj.verified,
            barrierfree: stationObj.barrierfree
        });
        // apply charge cards
        document.getElementById('station_cards').innerHTML = displayCards(stationObj.chargecards);
        // apply information
        document.getElementById('station_information').innerHTML = displayInformation(stationObj);
        // apply costs
        document.getElementById('station_costs').innerHTML = displayCosts(stationObj.cost);
        // apply opening times
        document.getElementById('station_openingtimes').innerHTML = displayOpeningTime(stationObj.openinghours);
        // apply photos, retrieve them first
        displayPhoto(stationObj.photos, function(err, photoRes) {
            // iterate through the tabs
            for (var i = 0; i < 3; i++) {
                document.getElementById('station_photo_' + (i + 1)).style.backgroundImage = photoRes || '';
            }
        });
    }
}

/**
 * Function which retrieves the given station photo id in binary and converts it to valid base64
 * @param  {Integer}   id       the station photo id to retrieve
 * @param  {Function} callback  callback function
 * @return {void}
 */
function retrieveStationPhoto(id, callback) {
    var xhttp = new XMLHttpRequest();

    xhttp.responseType = 'arraybuffer';
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            var binary = '',
                bytes = new Uint8Array(this.response);

            // convert the binary
            for (var i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
            // return
            callback(null, 'url("data:image/png;base64,' + btoa(binary)+ '")');
        }
    };
    // send xml request
    xhttp.open('POST', RESTURL + 'getstationphoto', true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify({id: id}));
}

/**
 * Function which retrieves all the available cards and saves them for later reference in localStorage (stationcards)
 * @param  {Function} callback  callback function
 * @return {void}
 */
function retrieveStationCards(callback) {
    sendRequest('getstationcards', {}, function(err, cardsRes) {
        if(!err && cardsRes && cardsRes.cards && cardsRes.cards.result) {
            // store cards in localStorage to be able to reference on them later
            setValue('stationcards', cardsRes.cards.result);
        }
        callback(err, cardsRes);
    });
}

/**
 * Function which starts navigation app on device based on current station object in list
 * @return {void}
 */
function startNavigation() {
    var stationObj = document.getElementById('stationList').stationObj;

    if(stationObj instanceof Object && stationObj.coordinates instanceof Object) {
        // ensure that we are on real device
        if(typeof window.cordova !== 'undefined' && typeof window.launchnavigator !== 'undefined') {
            // navigate to station
            launchnavigator.navigate([stationObj.coordinates.lat, stationObj.coordinates.lng]);
        }
    }
}
