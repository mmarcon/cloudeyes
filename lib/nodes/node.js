var channelLibrary = require('../channel'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter;

var Node = function(options){
    EventEmitter.call(this);

    options = options || {};
    this.debug = options.debug;
    this.channel = channelLibrary.getChannel(options.protocol || 'HTTP', {
        port: options.port,
        debug: options.debug,
        key: options.key
    });
};

util.inherits(Node, EventEmitter);

//Assumes all the nodes will have a
//`start` method. The first thing this method
//does is calling `this._start()` so the channel
//gets initialized.
Node.prototype._start = function(){
    this.channel.start();
};

Node.prototype.log = function(){
    if(this.debug) {
        console.log.apply(console, arguments);
    }
};

module.exports = Node;