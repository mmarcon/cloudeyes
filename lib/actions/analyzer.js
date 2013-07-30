var Q = require('q');

var Analyzer = {};

//The idea behind these *actions* is that they can
//be piped together one after the other with the use of promises.
//This `Analyzer` object is just sugar.
//
//Example:
//<pre><code>Analyzer.with({/*Options/Configuration*/})
//    .then(HTTPAnalyzer.analyze)
//    .then(DOMAnalyzer.analyze)
//    .then(MonkeyAnalyzer.analyze);</code></pre>
//
//The same `targetObject` is passed around from the beginning to the end and it is used to pass configuration
//and results (which could be configuration for the next step(s))

Analyzer.with = function(targetObject){
    var deferred = Q.defer();
    deferred.resolve(targetObject);
    return deferred.promise;
};

module.exports = Analyzer;