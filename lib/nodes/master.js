var Node = require('./node'),
    util = require('util'),
    async = require('async'),
    Utils = require('../utils'),
    Report = require('../reporting/report'),
    ChannelEvents = require('../channel').Events;

var Events = {
    REPORT_READY: 'master_report_ready'
};

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
        self.activeReport.newDataForRow(response.uuid, {
            ack: true,
            reachable: true
        });
    });
    self.channel.on(ChannelEvents.NACK, function(response){
        //Our command was not acknowledge, eye is there but something is wrong with it
        self.activeReport.newDataForRow(response.uuid, {
            ack: false,
            reachable: true
        });
        //Nothing else is gonna happen with this row
        self.activeReport.closeRow(response.uuid);
    });
    self.channel.on(ChannelEvents.ERROR, function(response){
        //Our command resulted in an error: eye is probably dead
        self.activeReport.newDataForRow(response.uuid, {
            reachable: false
        });
        //Nothing else is gonna happen with this row
        self.activeReport.closeRow(response.uuid);
    });
    self.channel.on(ChannelEvents.MESSAGE, function(message){
        //Got a message. Probably one of the reports I was waiting for
        self.activeReport.newDataForRow(message.uuid, message.data && message.data.report);
        self.activeReport.closeRow(message.uuid);
    });
    self.channel.on(ChannelEvents.COMMAND, function(command){
        //Our command was acknowledged, eye is there and active
        if(command.data && command.data.execute === 'createReport') {
            self.createReport();
        }
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

    self.activeReport = new Report();

    self.eyes.forEach(function(p){
        //I need to generate the UUID
        //outside the channel as it is needed to
        //prepare the report.
        //Try to think of a better solution.
        var uuid = Utils.uuid();
        //@TODO:
        //Later on there should be a sendCommand
        //that can send an array of commands
        self.hosts.forEach(function(h){
            var task = function(){
                self.channel.sendCommand(p, {
                    url: h.url,
                    selector: h.selector,
                    master: self.me
                }, uuid);
            };
            tasks.push(task);
        });
        self.activeReport.newRow(uuid);
    });

    self.activeReport.ready();

    //No rejection here...
    //Should be resolved with report
    //as argument
    self.activeReport.promise.done(reportIsReady);

    async.parallel(tasks);
};

//No need for this to be part of the prototype...
var reportIsReady = function(report){
    this.emit(Events.REPORT_READY, report);
};

//Add events to the exported function
Master.Events = Events;

module.exports = Master;