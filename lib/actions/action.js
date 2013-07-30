var Q = require('q');

var Action = {};

//The idea behind these *actions* is that they can
//be piped together one after the other with the use of promises.
//This `Action` object is just sugar.
//
//Example:
//<pre><code>Action.with({/*Options/Configuration*/})
//    .then(HTTPAnalyzer)
//    .then(DOMAnalyzer)
//    .then(MonkeyAnalyzer);</code></pre>
//
//The same `targetObject` is passed around from the beginning to the end and it is used to pass configuration
//and results (which could be configuration for the next step(s))

Action.with = function(targetObject){
    var deferred = Q.defer();
    deferred.resolve(targetObject);
    return deferred.promise;
};

module.exports = Action;