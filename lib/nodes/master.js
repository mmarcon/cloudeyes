var Node = require('./node'),
    util = require('util'),
    async = require('async'),
    // utils = require('../utils'),
    ChannelEvents = require('../channel').Events;

var Master = function(options){
    Node.call(this, options);
    this.eyes = options.eyes || [];
    this.hosts = options.hosts || [];
    this.activeReport = {};
    this.me = options.me;
};

util.inherits(Master, Node);

Master.prototype.start = function(){
    var self = this;
    //Call the parent's start
    self._start();
    //and go
    self.channel.on(ChannelEvents.ACK, function(response){
        //Our command was acknowledged, eye is there and active
        self.log(response);
    });
    self.channel.on(ChannelEvents.NACK, function(response){
        //Our command was not acknowledge, eye is there but something is wrong with it
        self.log(response);
    });
    self.channel.on(ChannelEvents.ERROR, function(response){
        //Our command resulted in an error: eye is probably dead
        self.log(response);
    });
    self.channel.on(ChannelEvents.MESSAGE, function(message){
        //Got a message. Probably one of the reports I was waiting for
        self.log(message);
    });
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
                self.channel.sendCommand(p, {
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