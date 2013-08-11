/*global describe, it, expect, jasmine, beforeEach, afterEach*/
var testutils = require('../testutils');
var Action = testutils.requireLocalModule('lib/actions/action');

describe('Report Formatter Action', function(){
    it('returns a fulfilled promise and calls then with the target object', function(){
        var ReportFormatter = testutils.requireLocalModule('lib/actions/report-formatter');
        var targetObject = {
            report: {

            }
        };

        var promise = Action.with(targetObject);

        promise.then(function(resultTargetObject){
            expect(resultTargetObject).toBe(targetObject);
        });
        promise.catch(function(){
            expect('should not').toBe('here');
        });
    });
});