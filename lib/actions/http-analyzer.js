var Q = require('q'),
    request = require('request');

var HTTPAnalyzer = {};

HTTPAnalyzer.analyze = function(targetObject){
    var url = targetObject.url,
        deferred = Q.defer(),
        requestConfiguration,
        requestCallback;
        
    requestConfiguration = {
        uri: url
    };
    requestCallback = function(error, response, body){
        if(error) {
            targetObject.code = -1;
            targetObject.reachable = false;
            return deferred.reject(targetObject);
        }
        targetObject.code = response.statusCode;
        targetObject.html = body;
        targetObject.reachable = true;
        return deferred.resolve(targetObject);
    };

    request(requestConfiguration, requestCallback);

    return deferred.promise;
};

module.exports = HTTPAnalyzer;