/*global describe, it, expect, jasmine, beforeEach, afterEach*/
var mockery = require('mockery'),
    testutils = require('../testutils'),
    config = require('../config'),
    path = require('path');

describe('Email Sender', function(){
    var emailjsMock, emailServerMock;
    beforeEach(function(){
        mockery.registerAllowable(path.join(config.basePath, 'lib/actions', 'dom-analyzer'), true);
        mockery.registerAllowable(path.join(config.basePath, 'lib/actions', 'action'), true);
        
        emailServerMock = {
            send: jasmine.createSpy('emailjs-server-send')
        };
        emailjsMock = {
            server: {
                connect: jasmine.createSpy('emailjs-server-connect').andReturn(emailServerMock)
            }
        };
    });
    afterEach(function() {
        mockery.disable();
        mockery.deregisterAll();
    });
    it('connects to the mail server', function(){
        mockery.registerMock('emailjs/email', emailjsMock);
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });
        
        var EmailSender = testutils.requireLocalModule('lib/actions/email-sender');
        EmailSender({
            emailserver: {
                host: 'smtp.gmail.com',
                user: 'user',
                password: 'password',
                ssl: true
            },
            plain: 'Hello dude!',
            html: '<html><body>Hello dude!</body></html>',
            from: 'hello@cloudey.es',
            subject: 'Cloudeyes says hello',
            recipients: [
                'max@cloudey.es'
            ]
        });
        
        expect(emailjsMock.server.connect).toHaveBeenCalledWith({
            host: 'smtp.gmail.com',
            user: 'user',
            password: 'password',
            ssl: true
        });
    });
});