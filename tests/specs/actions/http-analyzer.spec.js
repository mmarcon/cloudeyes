/*global describe, it, expect, jasmine, beforeEach, afterEach*/
var mockery = require('mockery'),
    testutils = require('../testutils'),
    config = require('../config'),
    path = require('path');

describe('HTTP Analyzer', function(){
    var requestMock;
    beforeEach(function(){
        mockery.registerAllowable(path.join(config.basePath, 'lib/actions', 'dom-analyzer'), true);
        mockery.registerAllowable(path.join(config.basePath, 'lib/actions', 'action'), true);

        requestMock = jasmine.createSpy('request');
    });
    afterEach(function() {
        mockery.disable();
        mockery.deregisterAll();
        requestMock.reset();
    });
    it('fires a HTTP request with the give URL/URI', function(){
        mockery.registerMock('request', requestMock);
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        var HTTPAnalyzer = testutils.requireLocalModule('lib/actions/http-analyzer');

        HTTPAnalyzer({url: 'http://google.com'});

        expect(requestMock).toHaveBeenCalledWith({uri: 'http://google.com'}, jasmine.any(Function));
    });

    it('resolves the promise when request succeeds', function(){
        mockery.registerMock('request', requestMock);
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        requestMock.andCallFake(function(option, callback){
            callback(null, {statusCode: 200}, '<html><body></body></html>');
        });

        var HTTPAnalyzer = testutils.requireLocalModule('lib/actions/http-analyzer');

        var promise = HTTPAnalyzer({url: 'http://google.com'});

        promise.then(function(resultTargetObject){
            expect(resultTargetObject.code).toBe(200);
            expect(resultTargetObject.reachable).toBe(true);
            expect(resultTargetObject.html).toBe('<html><body></body></html>');
        });
        promise.catch(function(){
            expect('should not').toBe('here');
        });
    });

    it('rejects the promise when request succeeds', function(){
        mockery.registerMock('request', requestMock);
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        requestMock.andCallFake(function(option, callback){
            callback(true/*Just anything truthy, really*/);
        });

        var HTTPAnalyzer = testutils.requireLocalModule('lib/actions/http-analyzer');

        var promise = HTTPAnalyzer({url: 'http://google.com'});

        promise.then(function(){
            expect('should not').toBe('here');
        });
        promise.catch(function(resultTargetObject){
            expect(resultTargetObject.code).toBe(-1);
            expect(resultTargetObject.reachable).toBe(false);
            expect(resultTargetObject.html).toBe(undefined);
        });
    });

    it('executes the analysis when chained', function(){
        var Action = testutils.requireLocalModule('lib/actions/action');
        mockery.registerMock('request', requestMock);
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        var HTTPAnalyzer = testutils.requireLocalModule('lib/actions/http-analyzer');

        Action.with({url: 'http://google.com'}).then(HTTPAnalyzer).then(function(){
            //Everything happens asyncronously
            //so it all ends here.
            expect(requestMock).toHaveBeenCalledWith({uri: 'http://google.com'}, jasmine.any(Function));
        });
    });
});