var Node = require('./node'),
    util = require('util');

var Master = function(options){
    Node.call(this, options);
};

util.inherits(Master, Node);

Master.prototype.start = function(){
    this._start();
};

module.exports = Master;