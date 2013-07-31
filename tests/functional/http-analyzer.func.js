var Actions = require('../../lib/actions'),
    assert = require('assert'),
    clc = require('cli-color'),
    Action = Actions.Action,
    HTTPAnalyzer = Actions.HTTPAnalyzer,
    Q = require('q');

var BASE_URL = 'http://mock.isssues.com/';

var tests = [
    {code: 200, message: 'Successful'},
    {code: 400, message: 'Bad Request'},
    {code: 404, message: 'Not Found'},
    {code: 500, message: 'Internal Server Error'}
];

var testFn = function(test) {
    var deferred = Q.defer();

    var targetObject = {
        url: BASE_URL + test.code
    };
    Action.with(targetObject).then(HTTPAnalyzer).done(function(o){
        try {
            assert.equal(BASE_URL + test.code, targetObject.url);
            assert.equal(test.code, o.code);
            assert.equal(test.message, targetObject.html);
        } catch(e) {
            console.log(clc.red('FAILURE!'), clc.red(JSON.stringify(e)));
            deferred.reject();
        }
        console.log(clc.green('All good, ' + o.code));
        deferred.resolve();
    });

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
        console.log(clc.green('=> HTTPAnalyzer: all passed'));
        deferred.resolve();
    }, function(){
        //Some failed
        console.log(clc.red('=> HTTPAnalyzer: some failed'));
        deferred.reject();
    });

    return deferred.promise;
}

module.exports = {
    run: run
}