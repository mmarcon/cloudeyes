var Node = require('./node'),
    util = require('util'),
    async = require('async'),
    utils = require('../utils');

var Master = function(options){
    Node.call(this, options);
    this.eyes = options.eyes || [];
    this.hosts = options.hosts || [];
    this.activeReport = {};
    this.me = options.me;
};

util.inherits(Master, Node);

Master.prototype.start = function(){
    this._start();
};

//For each of the *eyes*
//request a report for each of the
//hosts that have been configured for
//this master.
//
//Uses `async` module to send the commands in parallel.
Master.prototype.createReport = function(){
    var self = this,
        tasks = [];

    self.activeReport = {};

    self.eyes.forEach(function(p){
        self.hosts.forEach(function(h){
            var task = function(){
                var uuid = self.channel.sendCommand(p, {
                    url: h.url,
                    selector: h.selector,
                    master: self.me
                });
            };
            tasks.push(task);
        });
    });

    async.parallel(tasks);
};

module.exports = Master;