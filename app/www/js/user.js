/**
 * Function which guides user through the setup process in the specified language
 * @param  {String} lng the language to use
 */
function setup(lng) {
    swal.setDefaults({
        confirmButtonText: translate('NEXT', lng),
        showCancelButton: true,
        allowOutsideClick: false,
        showLoaderOnConfirm: true,
        animation: false,
        progressSteps: ['1', '2', '3']
    });

    var steps = [
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
