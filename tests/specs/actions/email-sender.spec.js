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
        emailServerMock.send.reset();
        emailjsMock.server.connect.reset();
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
    it('attemps to send one email for each of the recipents', function(){
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
                'max@cloudey.es',
                'cloud@cloudey.es'
            ]
        });
        
        expect(emailServerMock.send.callCount).toBe(2);
        expect(emailServerMock.send.mostRecentCall.args[0]).toEqual({
            text:    'Hello dude!',
            from:    'hello@cloudey.es',
            to:      'cloud@cloudey.es',
            subject: 'Cloudeyes says hello',
            attachment: [
                {data: '<html><body>Hello dude!</body></html>', alternative:true}
            ]
        });
    });
    it('resolves the promise when at least one email is sent successfully', function(){
        mockery.registerMock('emailjs/email', emailjsMock);
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });
        
        emailServerMock.send.andCallFake(function(options, callback){
            if(options.to === 'max@cloudey.es') {
                callback(new Error(':('), null);
            } else {
                callback(null, 'Yep!');
            }
        });
        
        var EmailSender = testutils.requireLocalModule('lib/actions/email-sender');
        
        var promise = EmailSender({
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
                'max@cloudey.es',
                'cloud@cloudey.es'
            ]
        });
        
        promise.then(function(o){
            expect(o.successfulEmails).toBeTruthy();
            expect(o.successfulEmails.length).toBe(1);
            expect(o.failedEmails).toBeTruthy();
            expect(o.failedEmails.length).toBe(1);
        });
        
        promise.catch(function(o){
            expect('Should not').toBe('here');
        });
    });
    it('resolves the promise when at all emails are sent successfully', function(){
        mockery.registerMock('emailjs/email', emailjsMock);
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });
        
        emailServerMock.send.andCallFake(function(options, callback){
            callback(null, 'Yep!');
        });
        
        var EmailSender = testutils.requireLocalModule('lib/actions/email-sender');
        
        var promise = EmailSender({
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
                'max@cloudey.es',
                'cloud@cloudey.es'
            ]
        });
        
        promise.then(function(o){
            expect(o.successfulEmails).toBeTruthy();
            expect(o.successfulEmails.length).toBe(2);
            expect(o.failedEmails).toBeTruthy();
            expect(o.failedEmails.length).toBe(0);
        });
        
        promise.catch(function(o){
            expect('Should not').toBe('here');
        });
    });
    it('rejects the promise when at all emails fail to be sent', function(){
        mockery.registerMock('emailjs/email', emailjsMock);
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });
        
        emailServerMock.send.andCallFake(function(options, callback){
            callback(new Error(':('));
        });
        
        var EmailSender = testutils.requireLocalModule('lib/actions/email-sender');
        
        var promise = EmailSender({
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
                'max@cloudey.es',
                'cloud@cloudey.es'
            ]
        });
        
        promise.catch(function(o){
            expect(o.successfulEmails).toBeTruthy();
            expect(o.successfulEmails.length).toBe(0);
            expect(o.failedEmails).toBeTruthy();
            expect(o.failedEmails.length).toBe(2);
        });
        
        promise.then(function(o){
            expect('Should not').toBe('here');
        });
    });
});