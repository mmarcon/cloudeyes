var Actions = require('../../lib/actions'),
    assert = require('assert'),
    clc = require('cli-color'),
    Action = Actions.Action,
    HTTPAnalyzer = Actions.HTTPAnalyzer,
    DOMAnalyzer = Actions.DOMAnalyzer
    Q = require('q');

var tests = [
    {url: 'http://google.com', selector: 'body', shouldMatch: true},
    {url: 'http://google.com', selector: '.monkey', shouldMatch: false}
];

var testFn = function(test) {
    var deferred = Q.defer();

    var always = function(o){
        try {
            assert.equal(o.url, test.url);
            assert.equal(o.code, 200);
            assert.equal(o.matched, o.shouldMatch);
        } catch(e) {
            console.log(clc.red('FAILURE!'), clc.red(JSON.stringify(e)));
            deferred.reject();
        }
        console.log(clc.green('All good, ' + o.url + ':' + o.selector + ' - matched: ' + o.matched));
        deferred.resolve();
    };

    Action.with(test).then(HTTPAnalyzer).then(DOMAnalyzer).done(always, always);

    return deferred.promise;
}

//@TODO:
//This run method is probably boilerplate
//that can be refactored out of here when
//other functional tests are provided.
function run(){
    var promises = tests.map(testFn),
        deferred = Q.defer();

    Q.all(promises).done(function(){
        //All passed
        console.log(clc.green('=> DOMAnalyzer: all passed'));
        deferred.resolve();
    }, function(){
        //Some failed
        console.log(clc.red('=> DOMAnalyzer: some failed'));
        deferred.reject();
    });

    return deferred.promise;
}

module.exports = {
    run: run
}