/*global describe, it, jasmine, beforeEach, expect*/
var testutils = require('../testutils');

var requireModule = testutils.requireLocalModule;

describe('JSON middleware', function(){
    var jsoninze, response;

    beforeEach(function(){
        jsoninze = requireModule('lib/middleware/json')();
        response = {
            writeHead: jasmine.createSpy('writeHead'),
            end: jasmine.createSpy('end')
        };
    });

    it('adds json method to response object', function(){
        jsoninze({}, response, function(){});
        expect(response.json).toEqual(jasmine.any(Function));
    });

    it('spits out JSON when response.json() is called', function(){
        jsoninze({}, response, function(){});
        response.json({foo: 'bar'});
        expect(response.writeHead).toHaveBeenCalledWith(200, {
            'Content-Type': 'application/json'
        });
        expect(response.end).toHaveBeenCalledWith(JSON.stringify({foo: 'bar'}));
    });

    it('spits out JSON and sets the correct HTTP status code when response.json() is called', function(){
        jsoninze({}, response, function(){});
        response.json({error: 'not found'}, 404);
        expect(response.writeHead).toHaveBeenCalledWith(404, {
            'Content-Type': 'application/json'
        });
        expect(response.end).toHaveBeenCalledWith(JSON.stringify({error: 'not found'}));
    });

    it('calls next() when done', function(){
        var next = jasmine.createSpy('next');
        jsoninze({}, response, next);
        response.json({foo: 'bar'});
        expect(next).toHaveBeenCalled();
    });
});