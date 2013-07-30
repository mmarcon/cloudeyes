/*global describe, it, expect*/
var testutils = require('../testutils');

var requireModule = testutils.requireLocalModule;

describe('Eye', function(){
    it('sets up an Eye as a Node', function(){
        var Eye = requireModule('lib/nodes/eye'),
            Node = requireModule('lib/nodes/node');

        var eye = new Eye({
            port: 3000,
            debug: false,
            key: '123-456',
            region: 'asia'
        });

        //The following essentially makes sure
        //that all the inheritance stuff is working
        //correctly.
        expect(eye instanceof Eye).toBe(true);
        expect(eye instanceof Node).toBe(true);
        expect(Eye.prototype.log).toEqual(jasmine.any(Function));
        expect(Eye.prototype._start).toEqual(jasmine.any(Function));
        expect(Eye.prototype.start).toEqual(jasmine.any(Function));
    });
});