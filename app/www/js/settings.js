/**
 * Settings handling
 */

/**
 * Function which loads the settings and applies them to the specific page elements
 */
function loadSettings() {
    var config = JSON.parse(getValue('config', '{}')),
        akey = document.getElementById('akey'),
        akeyDiv = document.getElementById('akeyDiv'),
        email = document.getElementById('email'),
        emailDiv = document.getElementById('emailDiv'),
        notifyVal = document.getElementById('notifyVal'),
        notifySlider = document.getElementById('notifySlider'),
        device = document.getElementById('device'),
        deviceDiv = document.getElementById('deviceDiv'),
        polling = document.getElementById('polling'),
        pollingDiv = document.getElementById('pollingDiv'),
        sync = document.getElementById('sync'),
        syncDiv = document.getElementById('syncDiv'),
        language = document.getElementById('language'),
        languageDiv = document.getElementById('languageDiv');

    if(getValue('akey')) {
        akey.value = getValue('akey');
        akeyDiv.className += ' is-upgraded is-focused';
    }
    if(config.email) {
        email.value = config.email;
        emailDiv.className += ' is-upgraded is-focused';
    }
    if(config.soc) {
        notifyVal.innerText = config.soc + ' %';
        notifySlider.MaterialSlider.change(config.soc);
    }
    if(config.deviceObj) {
        deviceDiv.className += ' is-dirty is-focused';
        device.value = config.deviceObj.name;
        device.setAttribute('data-val', config.deviceObj.id);
    }
    if(config.pollingObj) {
        pollingDiv.className += ' is-dirty is-focused';
        polling.value = config.pollingObj.title;
        polling.setAttribute('data-val', config.pollingObj.val);
    }
    if(config.syncObj) {
        syncDiv.className += ' is-dirty is-focused';
        sync.value = config.syncObj.title;
        sync.setAttribute('data-val', config.syncObj.val);
    }
    if(config.lngObj) {
        languageDiv.className += ' is-dirty is-focused';
        language.value = translate(config.lngObj.name, config.lngObj.lng);
        language.setAttribute('data-val', config.lngObj.lng);
        setValue('lng', config.lngObj.lng);
    }
    if(parseInt(getValue('telegram'), 0) > 0) {
        document.getElementById('telegramCheckbox').className += ' is-upgraded is-checked';
    }

    translatePage(getValue('lng', 'en'));
}

/**
 * Function which saves the settings and sends the new settings to backend server
 * NOTE: Requires the users account password to authenticate to prevent abuse
 */
function saveSettings() {
    var lngVal = document.getElementById('language').getAttribute('data-val'),
        lng = setValue('lng', ((lngVal && lngVal !== 'null')? lngVal : getValue('lng', 'en'))),
        settingsObj = setValue('config', {
            lngObj: {
                lng: lng,
                name: document.getElementById('language').value
            },
            lng: lng,
            car: 'IONIQ',   // later it will supports more cars
            telegram: getValue('telegram'),
            email: document.getElementById('email').value,
            push: false,
            soc: parseInt(document.getElementById('notifyVal').innerText.split(' ')[0]),
            deviceObj: {
                id: document.getElementById('device').getAttribute('data-val'),
                name: document.getElementById('device').value
            },
            device: document.getElementById('device').getAttribute('data-val'),
            pollingObj: {
                val: parseInt(document.getElementById('polling').getAttribute('data-val')),
                title: document.getElementById('polling').value
            },
            polling: parseInt(document.getElementById('polling').getAttribute('data-val')),
            syncObj: {
                val: parseInt(document.getElementById('sync').getAttribute('data-val')),
                title: document.getElementById('sync').value
            },
            autoSync: parseInt(document.getElementById('sync').getAttribute('data-val'))
        });

    translatePage(lng);

    swal({
        title: translate('SETTINGS_PASSWORD', lng),
        text: translate('SETTINGS_PASSWORD_TEXT', lng),
        input: 'password',
        showCancelButton: true,
        confirmButtonText: translate('NEXT', lng),
        cancelButtonText: translate('CANCEL', lng),
        showLoaderOnConfirm: true,
        inputValidator: function (input) {
            return new Promise(function (resolve, reject) {
                if (input.length >= 6) resolve();
                else reject(translate('PASSWORD_LENGTH_ERROR', lng));
            });
        },
        preConfirm: function (password) {
            return new Promise(function (resolve, reject) {
                setTimeout(function() {
                    // get user settings to fetch telegram information to prevent overwrite
                    sendRequest('settings', {
                        akey: getValue('akey'),
                        password: password,
                        token: getValue('token'),
                        option: 'GET'
                    }, function(err, settingsRes) {
                        if(!err && settingsRes && settingsRes.settings) {
                            // update telegram value
                            settingsObj.telegram = setValue('telegram', settingsRes.settings.telegram);
                            // update the settings
                            sendRequest('settings', {
                                akey: getValue('akey'),
                                password: password,
                                token: getValue('token'),
                                option: 'SET',
                                optionObj: settingsObj
                            }, function(err, settingsRes) {
                                if(!err && settingsRes) resolve();
                                else reject(translate('SET_SETTINGS_FAILED', lng));
                            });
                        } else reject(translate('GET_SETTINGS_FAILED', lng));
                    });
                }, 2000);
            });
        },
        allowOutsideClick: false
    }).then(function () {
        swal({
            type: 'success',
            title: translate('SET_SETTINGS_SUCCESSFUL', lng)
        });
    });
}

/**
 * Function which manages the telegram integration for the user
 * @param  {String} lng the language to use
 */
function manageTelegram(lng) {
    swal({
        title: translate('SETTINGS_PASSWORD', lng),
        text: translate('SETTINGS_PASSWORD_TEXT', lng),
        input: 'password',
        showCancelButton: true,
        confirmButtonText: translate('NEXT', lng),
        cancelButtonText: translate('CANCEL', lng),
        showLoaderOnConfirm: true,
        inputValidator: function (input) {
            return new Promise(function (resolve, reject) {
                if (input.length >= 6) resolve();
                else reject(translate('PASSWORD_LENGTH_ERROR', lng));
            });
        },
        preConfirm: function (password) {
            return new Promise(function (resolve, reject) {
                setTimeout(function() {
                    // get user settings
                    sendRequest('settings', {
                        akey: getValue('akey'),
                        password: password,
                        token: getValue('token'),
                        option: 'GET'
                    }, function(err, settingsRes) {
                        if(!err && settingsRes && settingsRes.settings) {
                            // update telegram value
                            setValue('telegram', settingsRes.settings.telegram);
                            resolve();
                        } else reject(translate('GET_SETTINGS_FAILED', lng));
                    });
                }, 2000);
            });
        },
        allowOutsideClick: false
    }).then(function () {
        if(parseInt(getValue('telegram', 0)) > 0) {
            // instruction of how to unsubscribe
            swal({
                type: 'info',
                title: translate('TELEGRAM_UNSUBSCRIBE', lng),
                html: translate('TELEGRAM_UNSUBSCRIBE_TEXT', lng)
            });
        } else {
            // instruction of how to subscribe
            swal({
                type: 'info',
                title: translate('TELEGRAM_SUBSCRIBE', lng),
                html: translate('TELEGRAM_SUBSCRIBE_TEXT', lng) + '<br>Token: ' + getValue('token')
            });
        }
    });
}

/**
* Function to switch account, retrieve new settings and save them
* @param  {String} lng the language to use for the dialogs
*/
function switchAccount(lng) {
    swal.queue([{
        title: translate('SWITCH_ACCOUNT', lng),
        text: translate('SWITCH_ACCOUNT_TEXT', lng),
        input: 'text',
        showLoaderOnConfirm: true,
        allowOutsideClick: false,
        inputValidator: function (input) {
            return new Promise(function (resolve, reject) {
                if (input.length === 6) resolve();
                else reject(translate('AKEY_LENGTH_ERROR', lng));
            });
        },
        preConfirm: function(akey) {
            return new Promise(function (resolve, reject) {
                // save entered akey
                setValue('akey', akey);
                // add password modal for login
                swal.insertQueueStep({
                    title: translate('LOGIN_PASSWORD', lng),
                    text: translate('LOGIN_PASSWORD_TEXT', lng),
                    input: 'password',
                    showLoaderOnConfirm: true,
                    allowOutsideClick: false,
                    inputValidator: function (input) {
                        return new Promise(function (resolve, reject) {
                            if (input.length >= 6) resolve();
                            else reject(translate('PASSWORD_LENGTH_ERROR', lng));
                        });
                    },
                    preConfirm: function(password) {
                        return new Promise(function (resolve, reject) {
                            setTimeout(function () {
                                // login account
                                sendRequest('login', {akey: getValue('akey'), password: password}, function(err, regRes) {
                                    if(!err && regRes) {
                                        setValue('token', regRes.token);
                                        // get and save current settings from new linked account
                                        syncSettings('pull', function(err, syncRes) {
                                            if(!err) resolve();
                                            else reject(translate('SYNC_SETTINGS_FAILED', lng));
                                        });
                                    } else reject(translate('LOGIN_FAILED', lng));
                                });
                            }, 2000);
                        });
                    }
                });
                resolve();
            });
        }
    }]).then(function() {
        swal({
            type: 'success',
            title: translate('SWITCH_ACCOUNT_SUCCESSFUL', lng)
        });
    });
}

/**
 * Function which allows to sync settings based on the type (pull/push)
 * NOTE: if no type is specified, a dialog prompts the user for the action to use
 * @param  {[type]}   type     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function syncSettings(type, callback) {
    var pullSettings = function(callback) {
            // get the settings from server
            sendRequest('sync', {akey: getValue('akey'), token: getValue('token'), type: 'pull'}, function(err, syncRes) {
                if(!err && syncRes && syncRes.syncRes) {
                    var settings = JSON.parse(getValue('config', '{}'));

                    // overwrite specific keys
                    settings.email = syncRes.syncRes.email;
                    settings.telegram = syncRes.syncRes.telegram;
                    settings.soc = syncRes.syncRes.soc;
                    settings.curSoC = syncRes.syncRes.curSoC;
                    settings.polling = syncRes.syncRes.polling;
                    settings.autoSync = syncRes.syncRes.autoSync;
                    settings.lng = syncRes.syncRes.lng;
                    settings.push = syncRes.syncRes.push;
                    // save new settings
                    setValue('config', settings);
                    loadSettings();
                }
                callback(err, syncRes);
            });
        },
        pushSettings = function(callback) {
            // push the current settings to server
            sendRequest('sync', {akey: getValue('akey'), token: getValue('token'), type: 'push', syncObj: JSON.parse(getValue('config', '{}'))}, function(err, syncRes) {
                callback(err, syncRes);
            });
        },
        lng = getValue('lng', 'en');

    if(type === 'pull') {
        // pull settings
        pullSettings(function(err, pullRes) {
            callback(err, pullRes);
        });
    } else if(type === 'push') {
        // push settings
        pushSettings(function(err, pushRes) {
            callback(err, pushRes);
        });
    } else {
        // show dialog
        swal({
            title: translate('SYNC', lng),
            text: translate('SYNC_TEXT', lng),
            input: 'select',
            inputOptions: {pull: translate('SYNC_TYPE_PULL', lng), sync: translate('SYNC_TYPE_PUSH', lng)},
            preConfirm: function (syncType) {
                return new Promise(function (resolve, reject) {
                    setTimeout(function() {
                        if(syncType === 'pull') {
                            pullSettings(function(err, pullRes) {
                                if(!err) resolve();
                                else reject(translate('SYNC_SETTINGS_FAILED', lng));
                            });
                        } else {
                            pushSettings(function(err, pushRes) {
                                if(!err) resolve();
                                else reject(translate('SYNC_SETTINGS_FAILED', lng));
                            });
                        }
                    }, 2000);
                });
            }
        }).then(function() {
            swal({
                type: 'success',
                title: translate('SYNC_SETTINGS_SUCCESSFUL', lng)
            });
        });
    }
}
