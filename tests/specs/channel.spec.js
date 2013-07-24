var mockery = require('mockery'),
    config = require('./config'),
    path = require('path');

function requireModule(module) {
    return require(path.join(config.basePath, module));
}

describe('Channel', function(){
    describe('Non-HTTP Channels', function(){
        it('throws when trying to instantiate a channel that is not supported', function(){
            var channel = requireModule('lib/channel'),
            getChannel,
            protocols = ['TCP', 'UDP', 'MONKEY'];

            getChannel = function(protocol){
                return function(){
                    channel.getChannel(protocol);
                };
            };

            protocols.forEach(function(p){
                expect(getChannel(p)).toThrow(new Error(p + ' not supported'));
            });
        });
    });

    describe('HTTP Channel', function(){
        var requestMock, connectMock, connectMockProto, listenFn;
        beforeEach(function(){
            mockery.registerAllowable(path.join(config.basePath, 'lib', 'channel'), true);

            requestMock = {};


            //Mocking Connect is kind of tricky:
            //First of all the module exports a function
            //which returns the instance.
            //So we mock a possible *prototype*
            connectMockProto = {
                use: jasmine.createSpy('connect.use'),
                listen: jasmine.createSpy('connect.listen')
            };
            //`use` returns the object itself for chainability.
            //also, I want a reference to the listening function
            //therefore I use a `andCallfake` to store it.
            connectMockProto.use.andCallFake(function(fn){
                listenFn = fn;
                return connectMockProto;
            });
            //`listen` returns the object itself as well
            connectMockProto.listen.andReturn(connectMockProto);
            //and finally this is the function/constructor
            connectMock = jasmine.createSpy('connect').andReturn(connectMockProto);
            //which has properties as well
            connectMock.bodyParser = jasmine.createSpy('bodyParser');
            connectMock.logger = jasmine.createSpy('logger');
        });

        afterEach(function() {
            mockery.disable();
            mockery.deregisterAll();
        });

        it('gets the HTTP channel (EventEmitter)', function(){
            var EventEmitter = require('events').EventEmitter;

            var channel = requireModule('lib/channel');
            expect(channel.getChannel('HTTP') instanceof EventEmitter).toBe(true);
        });

        it('configures Connect when the HTTP channel is started', function(){

            mockery.registerAllowable('events', true);
            mockery.registerAllowable('util', true);
            mockery.registerAllowable('request', true);

            mockery.registerMock('connect', connectMock);
            mockery.enable({
                useCleanCache: true,
                warnOnUnregistered: false
            });

            var channel = requireModule('lib/channel');

            var channelInstance = channel.getChannel('HTTP', {
                port: 1234
            });
            channelInstance.start();

            expect(connectMock).toHaveBeenCalled();
            expect(connectMock.bodyParser).toHaveBeenCalled();
            expect(connectMock.logger).toHaveBeenCalled();
            expect(connectMockProto.use.callCount).toBe(4);
            expect(connectMockProto.listen).toHaveBeenCalledWith(1234);
        });

        it('receives requests', function(){

            mockery.registerAllowable('events', true);
            mockery.registerAllowable('util', true);
            mockery.registerAllowable('request', true);

            mockery.registerMock('connect', connectMock);
            mockery.enable({
                useCleanCache: true,
                warnOnUnregistered: false
            });

            var channel = requireModule('lib/channel'),
                ChannelEvents = channel.Events;

            var onRequest = jasmine.createSpy();

            var channelInstance = channel.getChannel('HTTP', {
                port: 1234
            });
            channelInstance.start();

            channelInstance.on(ChannelEvents.REQUEST, onRequest);

            listenFn({body: {}}, {json: function(){}});

            expect(onRequest).toHaveBeenCalledWith({body: {}});
        });
    });
});