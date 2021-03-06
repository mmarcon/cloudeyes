/*global describe, it, expect, jasmine, beforeEach, afterEach*/
var mockery = require('mockery'),
    testutils = require('../testutils'),
    config = require('../config'),
    path = require('path');

describe('DOM Analyzer', function(){
    var jsdomMock, Document;
    beforeEach(function(){
        mockery.registerAllowable(path.join(config.basePath, 'lib/actions', 'dom-analyzer'), true);
        mockery.registerAllowable(path.join(config.basePath, 'lib/actions', 'action'), true);

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
    it('analizes the given piece of HTML', function(){
        mockery.registerMock('jsdom', jsdomMock);
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        Document.querySelectorAll.andReturn([]);

        var DOMAnalyzer = testutils.requireLocalModule('lib/actions/dom-analyzer');
        var html = '<html><body></body></html>';

        DOMAnalyzer({html: html, selector: 'body'});

        expect(jsdomMock.jsdom).toHaveBeenCalledWith(html);
        expect(Document.querySelectorAll).toHaveBeenCalledWith('body');
    });
    it('returns a rejected promise when selector does not match', function(){
        var DOMAnalyzer = testutils.requireLocalModule('lib/actions/dom-analyzer');
        var html = '<html><body></body></html>';
        var targetObject = {
            html: html,
            selector: '.monkey'
        };

        var promise = DOMAnalyzer(targetObject);

        promise.then(function(){
            expect('should not').toBe('here');
        });
        promise.catch(function(resultTargetObject){
            expect(resultTargetObject.matched).toBe(false);
        });
    });
    it('returns a fulfilled promise when selector matches', function(){
        var DOMAnalyzer = testutils.requireLocalModule('lib/actions/dom-analyzer');
        var html = '<html><body><div class="monkey"></div></body></html>';
        var targetObject = {
            html: html,
            selector: '.monkey'
        };

        var promise = DOMAnalyzer(targetObject);

        promise.then(function(resultTargetObject){
            expect(resultTargetObject.matched).toBe(true);
        });
        promise.catch(function(){
            expect('should not').toBe('here');
        });
    });
    it('executes the analysis when chained', function(){
        var DOMAnalyzer = testutils.requireLocalModule('lib/actions/dom-analyzer');
        var Action = testutils.requireLocalModule('lib/actions/action');
        var html = '<html><body><div class="monkey"></div></body></html>';
        var targetObject = {
            html: html,
            selector: '.monkey'
        };

        var promise = Action.with(targetObject).then(DOMAnalyzer);

        promise.then(function(resultTargetObject){
            expect(resultTargetObject.matched).toBe(true);
        });
        promise.catch(function(){
            expect('should not').toBe('here');
        });
    });
});