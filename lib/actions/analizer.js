var Q = require('q');

var Analizer = {};

//The idea behind these *actions* is that they can
//be piped together one after the other with the use of promised.
//This `Analizer` object is just sugar.
//
//Example:
//<pre><code>Analizer.with({/*Options/Configuration*/})
//    .then(HTTPAnalizer.analize)
//    .then(DOMAnalizer.analize)
//    .then(MonkeyAnalizer.analize);</code></pre>
//
//The same `targetObject` is passed around from the beginning to the end and it is used to pass configuration
//and results (which could be configuration for the next step(s))

Analizer.with = function(targetObject){
    var deferred = Q.defer();
    deferred.resolve(targetObject);
    return deferred.promise;
};

module.exports = Analizer;