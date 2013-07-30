/*global describe, it, expect, jasmine, beforeEach, afterEach*/
var testutils = require('../testutils');

describe('Analyzer', function(){
    it('returns a fulfilled promise and calls then with the target object', function(){
        var Analyzer = testutils.requireLocalModule('lib/actions/analyzer');
        var targetObject = {
            foo: 'bar'
        };

        var promise = Analyzer.with(targetObject);

        promise.then(function(resultTargetObject){
            expect(resultTargetObject).toBe(targetObject);
        });
        promise.catch(function(){
            expect('should not').toBe('here');
        });
    });
});