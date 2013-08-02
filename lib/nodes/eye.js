var Node = require('./node'),
    util = require('util'),
    ChannelEvents = require('../channel').Events,
    Actions = require('../actions'),
    Action = Actions.Action;

var Eye = function(options){
    Node.call(this, options);
};

util.inherits(Eye, Node);

Eye.prototype.start = function(){
    this._start();
    this.channel.on(ChannelEvents.COMMAND, function(command){
        Action.with(command.data);
    });
};

module.exports = Eye;