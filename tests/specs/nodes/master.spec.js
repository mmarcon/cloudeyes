/*global describe, it, expect*/
var testutils = require('../testutils');

var requireModule = testutils.requireLocalModule;

describe('Master', function(){
    it('sets up a Master as a Node', function(){
        var Master = requireModule('lib/nodes/master'),
            Node = requireModule('lib/nodes/node');

        var master = new Master({
            port: 3000,
            debug: false,
            key: '123-456',
            region: 'asia'
        });

        //The following essentially makes sure
        //that all the inheritance stuff is working
        //correctly.
        expect(master instanceof Master).toBe(true);
        expect(master instanceof Node).toBe(true);
        expect(Master.prototype.log).toEqual(jasmine.any(Function));
        expect(Master.prototype._start).toEqual(jasmine.any(Function));
        expect(Master.prototype.start).toEqual(jasmine.any(Function));
    });
});