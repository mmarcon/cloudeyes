var Q = require('q');

//An action that does nothing, just passes
//argument through with a resolve or reject
//that is useful for testing.
var Noop = function(targetObject){
    var deferred = Q.defer();
    if(targetObject.reject) {
        deferred.reject(targetObject);
    } else {
        deferred.resolve(targetObject);
    }
    return deferred.promise;
};

module.exports = Noop;