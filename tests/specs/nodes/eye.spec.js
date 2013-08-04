/*global describe, it, expect, jasmine, beforeEach, afterEach, spyOn*/
var mockery = require('mockery'),
    path = require('path'),
    testutils = require('../testutils'),
    config = require('../config');

var requireModule = testutils.requireLocalModule;

var Events = {
    REQUEST: 'channel_request',
    ACK: 'channel_ack',
    NACK: 'channel_nack',
    ERROR: 'channel_error',
    MESSAGE: 'channel_message',
    COMMAND: 'channel_command'
};

describe('Eye', function(){
    var channelMock,
        httpChannelMock;
    beforeEach(function(){
        mockery.registerAllowable(path.join(config.basePath, 'lib', 'nodes', 'eye'), true);
        httpChannelMock = {
            start: jasmine.createSpy('channel start'),
            on: jasmine.createSpy('channel on')
        };
        channelMock = {
            getChannel: jasmine.createSpy('getChannel')
                .andReturn(httpChannelMock),
            Events: Events
        };
    });
    afterEach(function() {
        mockery.disable();
        mockery.deregisterAll();
        httpChannelMock.start.reset();
        httpChannelMock.on.reset();
        channelMock.getChannel.reset();
    });
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

    it('starts an Eye', function(){
        mockery.registerMock('../channel', channelMock);
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        var Eye = requireModule('lib/nodes/eye');

        spyOn(Eye.prototype, '_start').andCallThrough();

        var eye = new Eye({
            port: 3000,
            debug: false,
            key: '123-456',
            region: 'asia'
        });

        expect(channelMock.getChannel)
            .toHaveBeenCalledWith('HTTP', {
                port: 3000,
                debug: false,
                key: '123-456'
            });

        eye.start();
        expect(Eye.prototype._start).toHaveBeenCalled();
    });

    it('acts when a command is received', function(){
        mockery.registerAllowable(path.join(config.basePath, 'lib', 'actions', 'action'), true);
        var Node = requireModule('lib/nodes/node');

        var Action = requireModule('lib/actions');
        //Return a fake promise, I don't need a real
        //promise for the purpose of this test.
        spyOn(Action.Action, 'with').andReturn({
            then: function(){
                return this;
            },
            done: function(){
                return this;
            }
        });

        var Eye = requireModule('lib/nodes/eye');

        var eye = new Eye({
            port: 3000,
            debug: false,
            key: '123-456',
            region: 'asia'
        });
        //Prevents channel to actually do
        //HTTP setup
        eye._start = function(){};
        eye.start();

        eye.channel.emit(Events.COMMAND, {foo: 'bar'});
        expect(Action.Action.with).toHaveBeenCalled();
        Action.Action.with.reset();
    });

    it('notifies the master when everything is ok', function(){
        mockery.registerAllowable(path.join(config.basePath, 'lib', 'actions', 'action'), true);

        var Action = requireModule('lib/actions');

        spyOn(Action, 'HTTPAnalyzer').andCallFake(Action.Noop);
        spyOn(Action, 'DOMAnalyzer').andCallFake(Action.Noop);

        var Eye = requireModule('lib/nodes/eye');
        Eye.prototype.notifyMaster = jasmine.createSpy('notifyMaster');

        var eye = new Eye({
            port: 3000,
            debug: false,
            key: '123-456',
            region: 'asia'
        });
        //Prevents channel to actually do
        //HTTP setup
        eye._start = function(){};
        eye.start();

        var fakeCommand = {
            url: 'http://www.google.com',
            selector: 'body',
            master: {
                host: 'master.cloudey.es',
                port: 8080
            },
            reject: false //Configures `Noop` to always resolve
        };

        //This test is a little intricate
        //Can't think of a better way though...
        spyOn(eye.channel, 'on').andCallFake(function(event, callback){
            var promise = callback(fakeCommand);
            //`Noop` does nothing, so the same object should
            //come back.
            promise.then(function(){
                expect(Eye.prototype.notifyMaster).toHaveBeenCalledWith(fakeCommand);
            });
        });
    });
    it('notifies the master even when something is not ok', function(){
        mockery.registerAllowable(path.join(config.basePath, 'lib', 'actions', 'action'), true);

        var Action = requireModule('lib/actions');
        spyOn(Action, 'HTTPAnalyzer').andCallFake(Action.Noop);
        spyOn(Action, 'DOMAnalyzer').andCallFake(Action.Noop);

        var Eye = requireModule('lib/nodes/eye');
        Eye.prototype.notifyMaster = jasmine.createSpy('notifyMaster');

        var eye = new Eye({
            port: 3000,
            debug: false,
            key: '123-456',
            region: 'asia'
        });
        //Prevents channel to actually do
        //HTTP setup
        eye._start = function(){};
        eye.start();

        var fakeCommand = {
            url: 'http://www.google.com',
            selector: 'body',
            master: {
                host: 'master.cloudey.es',
                port: 8080
            },
            reject: true //Configures `Noop` to always reject
        };

        //This test is a little intricate
        //Can't think of a better way though...
        spyOn(eye.channel, 'on').andCallFake(function(event, callback){
            var promise = callback(fakeCommand);
            //`Noop` does nothing, so the same object should
            //come back.
            promise.then(function(){
                expect(Eye.prototype.notifyMaster).toHaveBeenCalledWith(fakeCommand);
            });
        });
    });
});