/*global describe, it, expect, jasmine, beforeEach, afterEach*/
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
});