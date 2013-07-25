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

            requestMock = jasmine.createSpy('request');


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
            requestMock.reset();
            connectMock.reset();
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

        it('parses messages', function(){
            var channel = requireModule('lib/channel'),
                Message = requireModule('lib/message'),
                ChannelEvents = channel.Events;

            var channelInstance = channel.getChannel('HTTP', {
                port: 1234,
                key: 'kick-ass-test'
            });

            var onMessage = jasmine.createSpy(),
                message = Message.message({
                    foo: 'bar'
                }, 'kick-ass-test', 123);

            channelInstance.on(ChannelEvents.MESSAGE, onMessage);

            channelInstance.receive({
                body: message
            });

            expect(onMessage).toHaveBeenCalledWith(message);
        });

        it('fails to parse messages when key does not match', function(){
            var channel = requireModule('lib/channel'),
                Message = requireModule('lib/message'),
                ChannelEvents = channel.Events;

            var channelInstance = channel.getChannel('HTTP', {
                port: 1234,
                key: 'kick-ass-test'
            });

            var onMessage = jasmine.createSpy(),
                message = Message.message({
                    foo: 'bar'
                }, 'kick-ass-failing-test', 123);

            channelInstance.on(ChannelEvents.MESSAGE, onMessage);

            var rv = channelInstance.receive({
                body: message
            });

            expect(rv).toEqual({meta : 'Invalid Key', code : 403});
            expect(onMessage).not.toHaveBeenCalled();
        });

        it('parses commands', function(){
            var channel = requireModule('lib/channel'),
                Message = requireModule('lib/message'),
                ChannelEvents = channel.Events;

            var channelInstance = channel.getChannel('HTTP', {
                port: 1234,
                key: 'kick-ass-test'
            });

            var onCommand = jasmine.createSpy(),
                command = Message.command({
                    foo: 'bar'
                }, 'kick-ass-test', 123);

            channelInstance.on(ChannelEvents.COMMAND, onCommand);

            channelInstance.receive({
                body: command
            });

            expect(onCommand).toHaveBeenCalledWith(command);
        });

        it('fails to parse commands when key does not match', function(){
            var channel = requireModule('lib/channel'),
                Message = requireModule('lib/message'),
                ChannelEvents = channel.Events;

            var channelInstance = channel.getChannel('HTTP', {
                port: 1234,
                key: 'kick-ass-test'
            });

            var onCommand = jasmine.createSpy(),
                command = Message.command({
                    foo: 'bar'
                }, 'kick-ass-failing-test', 123);

            channelInstance.on(ChannelEvents.COMMAND, onCommand);

            var rv = channelInstance.receive({
                body: command
            });

            expect(rv).toEqual({meta : 'Invalid Key', code : 403});
            expect(onCommand).not.toHaveBeenCalled();
        });

        it('fails to parse unknown message types', function(){
            var channel = requireModule('lib/channel'),
                Message = requireModule('lib/message'),
                ChannelEvents = channel.Events;

            var channelInstance = channel.getChannel('HTTP', {
                port: 1234,
                key: 'kick-ass-test'
            });

            var onMessage = jasmine.createSpy(),
                message = Message.message({
                    foo: 'bar'
                }, 'kick-ass-test', 123);

            message.type = 'wrongtype';

            channelInstance.on(ChannelEvents.MESSAGE, onMessage);

            var rv = channelInstance.receive({
                body: message
            });

            expect(rv).toBe(false);
            expect(onMessage).not.toHaveBeenCalled();
        });

        it('sends messages', function(){
            mockery.registerAllowable('events', true);
            mockery.registerAllowable('util', true);
            mockery.registerAllowable('connect', true);

            mockery.registerMock('request', requestMock);
            mockery.enable({
                useCleanCache: true,
                warnOnUnregistered: false
            });

            var channel = requireModule('lib/channel'),
                Message = requireModule('lib/message');

            var channelInstance = channel.getChannel('HTTP', {
                port: 1234,
                key: 'kick-ass-test'
            });

            var recipient = {
                host: 'recipient.cloudey.es',
                port: 80
            };

            var payload = {the: 'message'};

            channelInstance.send(recipient, payload, 123)
            expect(requestMock).toHaveBeenCalledWith({
                uri: 'http://recipient.cloudey.es:80',
                json: Message.message(payload, 'kick-ass-test', 123)
            }, jasmine.any(Function));
        });

        it('sends commands', function(){
            mockery.registerAllowable('events', true);
            mockery.registerAllowable('util', true);
            mockery.registerAllowable('connect', true);

            mockery.registerMock('request', requestMock);
            mockery.enable({
                useCleanCache: true,
                warnOnUnregistered: false
            });

            var channel = requireModule('lib/channel'),
                Message = requireModule('lib/message');

            var channelInstance = channel.getChannel('HTTP', {
                port: 1234,
                key: 'kick-ass-test'
            });

            var recipient = {
                host: 'recipient.cloudey.es',
                port: 80
            };

            var payload = {the: 'command'};

            channelInstance.sendCommand(recipient, payload, 123)
            expect(requestMock).toHaveBeenCalledWith({
                uri: 'http://recipient.cloudey.es:80',
                json: Message.command(payload, 'kick-ass-test', 123)
            }, jasmine.any(Function));
        });

        it('notifies sender when message is sent successfully (ACK)', function(){
            mockery.registerAllowable('events', true);
            mockery.registerAllowable('util', true);
            mockery.registerAllowable('connect', true);

            mockery.registerMock('request', requestMock);
            mockery.enable({
                useCleanCache: true,
                warnOnUnregistered: false
            });

            var channel = requireModule('lib/channel'),
                Message = requireModule('lib/message'),
                ChannelEvents = channel.Events;

            var channelInstance = channel.getChannel('HTTP', {
                port: 1234,
                key: 'kick-ass-test'
            });

            var recipient = {
                host: 'recipient.cloudey.es',
                port: 80
            };

            var payload = {the: 'message'};

            requestMock.andCallFake(function(options, callback){
                callback(null, {
                    statusCode: 200
                }, {
                    status: Message.status.OK,
                    type: Message.type.ACK
                });
            });

            var onACK = jasmine.createSpy();

            channelInstance.on(ChannelEvents.ACK, onACK);

            channelInstance.send(recipient, payload, 123)

            expect(onACK).toHaveBeenCalledWith({
                status: Message.status.OK,
                type: Message.type.ACK,
                uuid: 123,
                recipient: undefined
            });
        });

        it('notifies sender when message is sent unsuccessfully (NACK)', function(){
            mockery.registerAllowable('events', true);
            mockery.registerAllowable('util', true);
            mockery.registerAllowable('connect', true);

            mockery.registerMock('request', requestMock);
            mockery.enable({
                useCleanCache: true,
                warnOnUnregistered: false
            });

            var channel = requireModule('lib/channel'),
                Message = requireModule('lib/message'),
                ChannelEvents = channel.Events;

            var channelInstance = channel.getChannel('HTTP', {
                port: 1234,
                key: 'kick-ass-test'
            });

            var recipient = {
                host: 'recipient.cloudey.es',
                port: 80
            };

            var payload = {the: 'message'};

            requestMock.andCallFake(function(options, callback){
                callback(null, {
                    statusCode: 200
                }, {
                    status: Message.status.OK,
                    type: Message.type.NACK
                });
            });

            var onNACK = jasmine.createSpy();

            channelInstance.on(ChannelEvents.NACK, onNACK);

            channelInstance.send(recipient, payload, 123)

            expect(onNACK).toHaveBeenCalledWith({
                status: Message.status.OK,
                type: Message.type.NACK,
                uuid: 123,
                recipient: undefined
            });
        });

        it('notifies sender when message is sent unsuccessfully (ERROR)', function(){
            mockery.registerAllowable('events', true);
            mockery.registerAllowable('util', true);
            mockery.registerAllowable('connect', true);

            mockery.registerMock('request', requestMock);
            mockery.enable({
                useCleanCache: true,
                warnOnUnregistered: false
            });

            var channel = requireModule('lib/channel'),
                Message = requireModule('lib/message'),
                ChannelEvents = channel.Events;

            var channelInstance = channel.getChannel('HTTP', {
                port: 1234,
                key: 'kick-ass-test'
            });

            var recipient = {
                host: 'recipient.cloudey.es',
                port: 80
            };

            var payload = {the: 'message'};

            requestMock.andCallFake(function(options, callback){
                callback(new Error('error here'), {
                    statusCode: 500
                }, null);
            });

            var onERROR = jasmine.createSpy();

            channelInstance.on(ChannelEvents.ERROR, onERROR);

            channelInstance.send(recipient, payload, 123)

            expect(onERROR).toHaveBeenCalledWith(null);
        });

        it('notifies sender when command is sent successfully (ACK)', function(){
            mockery.registerAllowable('events', true);
            mockery.registerAllowable('util', true);
            mockery.registerAllowable('connect', true);

            mockery.registerMock('request', requestMock);
            mockery.enable({
                useCleanCache: true,
                warnOnUnregistered: false
            });

            var channel = requireModule('lib/channel'),
                Message = requireModule('lib/message'),
                ChannelEvents = channel.Events;

            var channelInstance = channel.getChannel('HTTP', {
                port: 1234,
                key: 'kick-ass-test'
            });

            var recipient = {
                host: 'recipient.cloudey.es',
                port: 80
            };

            var payload = {the: 'command'};

            requestMock.andCallFake(function(options, callback){
                callback(null, {
                    statusCode: 200
                }, {
                    status: Message.status.OK,
                    type: Message.type.ACK
                });
            });

            var onACK = jasmine.createSpy();

            channelInstance.on(ChannelEvents.ACK, onACK);

            channelInstance.sendCommand(recipient, payload, 123)

            expect(onACK).toHaveBeenCalledWith({
                status: Message.status.OK,
                type: Message.type.ACK,
                uuid: 123,
                recipient: undefined
            });
        });

        it('notifies sender when command is sent unsuccessfully (NACK)', function(){
            mockery.registerAllowable('events', true);
            mockery.registerAllowable('util', true);
            mockery.registerAllowable('connect', true);

            mockery.registerMock('request', requestMock);
            mockery.enable({
                useCleanCache: true,
                warnOnUnregistered: false
            });

            var channel = requireModule('lib/channel'),
                Message = requireModule('lib/message'),
                ChannelEvents = channel.Events;

            var channelInstance = channel.getChannel('HTTP', {
                port: 1234,
                key: 'kick-ass-test'
            });

            var recipient = {
                host: 'recipient.cloudey.es',
                port: 80
            };

            var payload = {the: 'command'};

            requestMock.andCallFake(function(options, callback){
                callback(null, {
                    statusCode: 200
                }, {
                    status: Message.status.OK,
                    type: Message.type.NACK
                });
            });

            var onNACK = jasmine.createSpy();

            channelInstance.on(ChannelEvents.NACK, onNACK);

            channelInstance.sendCommand(recipient, payload, 123)

            expect(onNACK).toHaveBeenCalledWith({
                status: Message.status.OK,
                type: Message.type.NACK,
                uuid: 123,
                recipient: undefined
            });
        });

        it('notifies sender when command is sent unsuccessfully (ERROR)', function(){
            mockery.registerAllowable('events', true);
            mockery.registerAllowable('util', true);
            mockery.registerAllowable('connect', true);

            mockery.registerMock('request', requestMock);
            mockery.enable({
                useCleanCache: true,
                warnOnUnregistered: false
            });

            var channel = requireModule('lib/channel'),
                Message = requireModule('lib/message'),
                ChannelEvents = channel.Events;

            var channelInstance = channel.getChannel('HTTP', {
                port: 1234,
                key: 'kick-ass-test'
            });

            var recipient = {
                host: 'recipient.cloudey.es',
                port: 80
            };

            var payload = {the: 'command'};

            requestMock.andCallFake(function(options, callback){
                callback(new Error('error here'), {
                    statusCode: 500
                }, null);
            });

            var onERROR = jasmine.createSpy();

            channelInstance.on(ChannelEvents.ERROR, onERROR);

            channelInstance.sendCommand(recipient, payload, 123)

            expect(onERROR).toHaveBeenCalledWith(null);
        });
    });
});