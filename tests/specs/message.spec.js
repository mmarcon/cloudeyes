/*global describe, it, expect*/
var testutils = require('./testutils');

var Message = testutils.requireLocalModule('lib/message');

describe('Message', function(){
    it('creates ACK message', function(){
        var message = Message.ACK('Everything alright');
        expect(message).toEqual({
            status: 0,
            type: 'ACK',
            data: 'Everything alright'
        });
    });

    it('creates NACK message', function(){
        var message = Message.NACK('Something is wrong');
        expect(message).toEqual({
            status: 1,
            type: 'NACK',
            data: 'Something is wrong'
        });
    });

    it('creates plain message', function(){
        var message = Message.message({foo: 'bar'}, '123-abc-678', 123);
        expect(message).toEqual({
            status: 0,
            type: 'MESSAGE',
            data: {foo: 'bar'},
            key: '123-abc-678',
            uuid: 123
        });
    });

    it('creates command message', function(){
        var message = Message.command({foo: 'bar'}, '123-abc-678', 123);
        expect(message).toEqual({
            status: 0,
            type: 'COMMAND',
            data: {foo: 'bar'},
            key: '123-abc-678',
            uuid: 123
        });
    });
});