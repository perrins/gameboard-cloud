// wrap up invocation complexity
var request = require('request');
var Q = require("q");
var _ = require('underscore-node');
var fs = require("fs");

var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

var invokeRoute = function (route,type,server,data,params) {

    _headers = {"Content-Type":"application/json"};

    // Handle Queries
    var query = null;
    if(!_.isUndefined(params)) {
        query = joinify(params,"&");
    }

    var server = null;
    if (!config.local) {
        server = config.applicationRoute;
    } else {
        server = config.localserver;
    }

    // Add the Application route to the URL path
    server += "/gameboard-cloud/v1/apps/" + config.applicationId;

    // Build a URL to call
    var _path = route;

    _path = server+_path
    if(!_.isNull(query)) {
        _path += "?"+query;
    }
    _path = encodeURI(_path);

    // Build a Defer wrapper around the ASync Call
    var def = Q.defer();

    // Define the Payload
    var input = {
        method 				: type,
        headers 			: _headers,
        url 				: _path
    };

    // Merge the Data
    if(_.isObject(data)) {
        input = _.extend(input,data);
    }

    // Make the Call to the Service
    request(input, function (error, response, body) {

        if (_.isNull(error) && response.statusCode == 200) {
            var _body = JSON.parse(body);
            _body["response"] = response;
            def.resolve(_body);
        } else if (_.isNull(error) && response.statusCode >= 400 ) {
            def.reject(error);
        } else {
            def.reject(error);
        }
    });

    return def.promise;
};

// Utility Function
function joinify(oldArray, separator){

    var newArray = "";
    var count = 0;
    for(var attributename in oldArray){
        newArray = newArray+(attributename+"="+oldArray[attributename]);
        if(count<oldArray.length){
            newArray += separator;
        }
        count++;
    }
    return newArray;
}

// Export our entry point
exports.invoke = invokeRoute;
