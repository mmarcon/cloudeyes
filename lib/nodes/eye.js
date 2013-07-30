var Node = require('./node'),
    util = require('util');

var Eye = function(options){
    Node.call(this, options);
};

util.inherits(Eye, Node);

Eye.prototype.start = function(){
    this._start();
};

module.exports = Eye;