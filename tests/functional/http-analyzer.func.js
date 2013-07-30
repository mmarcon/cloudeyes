var Actions = require('../../lib/actions'),
    assert = require('assert'),
    clc = require('cli-color'),
    Action = Actions.Action,
    HTTPAnalyzer = Actions.HTTPAnalyzer;

var BASE_URL = 'http://mock.isssues.com/';

var tests = [
    {code: 200, message: 'Successful'},
    {code: 400, message: 'Bad Request'},
    {code: 404, message: 'Not Found'},
    {code: 500, message: 'Internal Server Error'}
];

var testFn = function(test) {
    var targetObject = {
        url: BASE_URL + test.code
    };
    Action.with(targetObject).then(HTTPAnalyzer).then(function(o){
        try {
            assert.equal(BASE_URL + test.code, targetObject.url);
            assert.equal(test.code, o.code);
            assert.equal(test.message, targetObject.html);
        } catch(e) {
            return console.log(clc.red(JSON.stringify(e)));
        }
        console.log(clc.green('All good, ' + o.code));
    });
}

tests.forEach(testFn);