/*global describe, it, expect, jasmine*/
var mockery = require('mockery'),
    testutils = require('../testutils'),
    config = require('../config'),
    path = require('path');

describe('DOM Analizer', function(){
    var jsdomMock, Document;
    beforeEach(function(){
        mockery.registerAllowable(path.join(config.basePath, 'lib/actions', 'dom-analizer'), true);

        Document = {
            querySelectorAll: jasmine.createSpy('querySelectorAll')
        }
        jsdomMock = {
            jsdom: jasmine.createSpy('jsdom').andReturn(Document)
        }
    });
    afterEach(function() {
        mockery.disable();
        mockery.deregisterAll();
        jsdomMock.jsdom.reset();
        Document.querySelectorAll.reset();
    });
    it('Analizes the given piece of HTML', function(){
        mockery.registerMock('jsdom', jsdomMock);
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        Document.querySelectorAll.andReturn([]);

        var DOMAnalizer = testutils.requireLocalModule('lib/actions/dom-analizer');
        var html = '<html><body></body></html>';

        DOMAnalizer.analize({html: html, selector: 'body'});

        expect(jsdomMock.jsdom).toHaveBeenCalledWith(html);
        expect(Document.querySelectorAll).toHaveBeenCalledWith('body');
    });
    it('Returns a rejected promise when selector does not match', function(){
        var DOMAnalizer = testutils.requireLocalModule('lib/actions/dom-analizer');
        var html = '<html><body></body></html>';
        var targetObject = {
            html: html,
            selector: '.monkey'
        };

        var promise = DOMAnalizer.analize(targetObject);

        expect(promise.isRejected()).toBe(true);

        promise.then(function(){
            expect('should not').toBe('here');
        });
        promise.catch(function(resultTargetObject){
            expect(resultTargetObject.matched).toBe(false);
        });
    });
    it('Returns a rejected promise when selector matches', function(){
        var DOMAnalizer = testutils.requireLocalModule('lib/actions/dom-analizer');
        var html = '<html><body><div class="monkey"></div></body></html>';
        var targetObject = {
            html: html,
            selector: '.monkey'
        };

        var promise = DOMAnalizer.analize(targetObject);

        expect(promise.isFulfilled()).toBe(true);

        promise.then(function(resultTargetObject){
            expect(resultTargetObject.matched).toBe(true);
        });
        promise.catch(function(){
            expect('should not').toBe('here');
        });
    });
});