var Q = require('q'),
    jsdom = require('jsdom').jsdom;

var DOMAnalyzer = function(targetObject){
    var html = targetObject.html,
        selector = targetObject.selector;

    var deferred = Q.defer(),
        doc = jsdom(html),
        matches;

    matches = doc.querySelectorAll(selector);
    if(matches.length > 0) {
        targetObject.matched = true;
        deferred.resolve(targetObject);
    } else {
        targetObject.matched = false;
        deferred.reject(targetObject);
    }

    return deferred.promise;
};

module.exports = DOMAnalyzer;