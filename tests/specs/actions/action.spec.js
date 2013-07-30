/*global describe, it, expect, jasmine, beforeEach, afterEach*/
var testutils = require('../testutils');

describe('Action', function(){
    it('returns a fulfilled promise and calls then with the target object', function(){
        var Action = testutils.requireLocalModule('lib/actions/action');
        var targetObject = {
            foo: 'bar'
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