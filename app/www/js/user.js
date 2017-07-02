/**
 * Function which guides user through the setup process in the specified language
 * @param  {String} lng the language to use (user will be asked for prefered language also in the setup process)
 */
function setup(lng) {
    swal.setDefaults({
        confirmButtonText: translate('NEXT', lng),
        cancelButtonText: translate('CANCEL', lng),
        showCancelButton: true,
        allowOutsideClick: false,
        showLoaderOnConfirm: true,
        animation: true,
        progressSteps: ['1', '2', '3', '4']
    });

    var steps = [
        {
            title: translate('LANGUAGE_SETUP', lng),
            input: 'select',
            inputOptions: {en: translate('LNG_EN', lng), de: translate('LNG_DE', lng)}, // available languages
            showCancelButton: true,
            preConfirm: function (language) {
                return new Promise(function (resolve, reject) {
                    lng = setValue('lng', language);
                    resolve();
                });
            }
        },
        {
            title: translate('WELCOME', lng),
            text: translate('WELCOME_TEXT', lng),
            preConfirm: function () {
                return new Promise(function (resolve, reject) {
                    setTimeout(function() {
                        // get key for account to prepare registration
                        sendRequest('getkey', false, function(err, keyRes) {
                            if(!err && keyRes) {
                                setValue('akey', keyRes.akey);
                                resolve();
                            } else reject(translate('CONNECTION_ERROR', lng));
                        });
                    }, 2000)
                });
            }
        },
        {
            title: translate('REGISTER', lng),
            text: translate('REGISTER_TEXT', lng),
            input: 'password',
            inputAttributes: {min: 6},
            preConfirm: function(password) {
                return new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        // register account
                        sendRequest('register', {akey: getValue('akey'), password: password}, function(err, regRes) {
                            if(!err && regRes) {
                                setValue('token', regRes.token);
                                resolve();
                            } else reject(translate('CONNECTION_ERROR', lng));
                        });
                    }, 2000);
                });
            }
        },
        {
            title: translate('SETUP_COMPLETE', lng),
            text: translate('SETUP_COMPLETE_TEXT', lng)
        }
    ];

    swal.queue(steps).then(function (result) {
        swal.resetDefaults();
        // go to settings page after successfull registration
        window.location.href = './settings.html';
    }, function () {
        swal.resetDefaults();
    });
}

/**
 * Function which logins the user to retrieve token
 * NOTE: This function is normally not necessary because on setup the user retrieves a valid token
 * Will be useful later if user can change account to connect the account with multiple devices
 * @param  {String} lng the language to use for the login process
 */
function login(lng) {
    swal({
        title: translate('LOGIN_TEXT', lng),
        input: 'password',
        inputAttributes: {min: 6},
        showCancelButton: true,
        cancelButtonText: translate('CANCEL', lng),
        confirmButtonText: translate('LOGIN', lng),
        showLoaderOnConfirm: true,
        preConfirm: function (password) {
            return new Promise(function (resolve, reject) {
                setTimeout(function() {
                    sendRequest('login', {akey: getValue('akey'), password: password}, function(err, loginRes) {
                        if(!err && loginRes) {
                            setValue('token', loginRes.token);
                            resolve();
                        } else reject(translate('LOGN_FAILED', lng));
                    });
                }, 2000)
            });
        },
        allowOutsideClick: false
    }).then(function (email) {
        swal({
            type: 'success',
            title: translate('LOGIN_SUCCESSFUL', lng)
        });
    });
}

/**
 * Function which changes the password for the account
 * @param  {String} lng the language to use for the change password process
 */
function changePW(lng) {
    swal.setDefaults({
        input: 'password',
        confirmButtonText: translate('NEXT', lng),
        cancelButtonText: translate('CANCEL', lng),
        showCancelButton: true,
        allowOutsideClick: false,
        inputValidator: function (input) {
            return new Promise(function (resolve, reject) {
                if (input.length >= 6) resolve();
                else reject(translate('PASSWORD_LENGTH_ERROR'));
            });
        },
        progressSteps: ['1', '2', '3']
    });

    var oldPW,
        pw1,
        steps = [
        {
            title: translate('OLD_PASSWORD', lng),
            text: translate('OLD_PASSWORD_TEXT', lng),
            preConfirm: function(password) {
                return new Promise(function (resolve, reject) {
                    oldPW = password;
                    resolve();
                });
            }
        },
        {
            title: translate('NEW_PASSWORD', lng),
            text: translate('NEW_PASSWORD_TEXT', lng),
            preConfirm: function(password) {
                return new Promise(function (resolve, reject) {
                    pw1 = password;
                    resolve();
                });
            }
        },
        {
            title: translate('NEW_PASSWORD_RETYPE', lng),
            text: translate('NEW_PASSWORD_RETYPE_TEXT', lng),
            showLoaderOnConfirm: true,
            preConfirm: function (password) {
                return new Promise(function (resolve, reject) {
                    setTimeout(function() {
                        if (password !== pw1) reject(translate('PASSWORD_MISMATCH'));
                        else {
                            sendRequest('changepw', {
                                akey: getValue('akey'),
                                token: getValue('token'),
                                password: oldPW,
                                newpassword: password
                            }, function(err, changeRes) {
                                if(!err && changeRes) resolve();
                                else reject(translate('CHANGE_PASSWORD_FAILED', lng));
                            });
                        }
                    }, 2000)
                });
            }
        }
    ];

    swal.queue(steps).then(function (result) {
        swal.resetDefaults()
        swal({
            title: translate('CHANGE_PASSWORD_SUCCESSFUL'),
            confirmButtonText: 'OK',
            type: 'success',
            showCancelButton: false
        });
    }, function () {
        swal.resetDefaults()
    });
}
