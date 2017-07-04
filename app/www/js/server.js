/**
 * Function which sends a specific request to backend server and returns the information/data (or error information if any)
 * @param  {String}     fnc         the function which should be used (e.g. login)
 * @param  {*}          data        the data to send (mostly an object)
 * @param  {Function}   callback    callback function
 */
var sendRequest = function(fnc, data, callback) {
    $.ajax({
        type: 'POST',
        url: RESTURL + ((fnc)? fnc : ''),
        data: JSON.stringify(data),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json'
    }).done(function(data) {
        callback(null, data);   // return the data
    }).fail(function(request, status, error) {
        callback({request: request, status: status, error: error}, null);   // return error information
    })
};
