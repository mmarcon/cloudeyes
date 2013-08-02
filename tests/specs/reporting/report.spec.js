/*global describe, it, expect, jasmine*/
var testutils = require('../testutils'),
    Q = require('q');

var Report = testutils.requireLocalModule('lib/reporting/report');

describe('Message', function(){
    it('creates a report', function(){
        var r = new Report();
        expect(r.rows).toEqual(jasmine.any(Array));
        expect(r.rowIndexes).toEqual(jasmine.any(Object));
        expect(r.promise).toBe(null);
    });
    it('creates new rows in a report', function(){
        var r = new Report();

        r.newRow('123-456');
        r.newRow('789-abc');
        r.newRow('012-def');

        expect(r.rows.length).toBe(3);
        expect(r.rowIndexes['123-456']).toBe(0);
        expect(r.promise).toBe(null);
    });
    it('prepares the report to be filled with data', function(){
        var r = new Report();

        r.newRow('123-456');
        r.newRow('789-abc');
        r.newRow('012-def');

        r.ready();

        expect(r.promise).not.toBe(null);
        expect(r.promise.done)
            .toEqual(jasmine.any(Function));
    });
    it('puts data into a row', function(){
        var r = new Report();

        r.newRow('123-456');
        r.ready();

        r.newDataForRow('123-456', {
            reachable: false
        });

        expect(r.rows[r.rowIndexes['123-456']]).toEqual({
            uuid: '123-456',
            reachable: false,
            deferred: jasmine.any(Object)
        });
    });
    it('puts data into a row, but does not reassign the deferred property', function(){
        var r = new Report();

        r.newRow('123-456');
        r.ready();

        r.newDataForRow('123-456', {
            reachable: false,
            deferred: 'monkey'
        });

        expect(r.rows[r.rowIndexes['123-456']]).toEqual({
            uuid: '123-456',
            reachable: false,
            deferred: jasmine.any(Object)
        });
        expect(r.rows[r.rowIndexes['123-456']].deferred).not.toBe('monkey');
    });
    it('resolves the promise when all rows are closed', function(){
        var r = new Report();

        r.newRow('123-456');
        r.newRow('789-abc');
        r.ready();

        r.newDataForRow('123-456', {
            reachable: false
        });

        r.closeRow('123-456');

        r.newDataForRow('789-abc', {
            reachable: false
        });

        r.closeRow('789-abc');
        
        r.promise.done(function(report){
            expect(report).toBe(r);
        });
    });
});