var channelLibrary = require('./channel'),
    ChannelEvents = channelLibrary.Events,
    EventEmitter = require('events').EventEmitter,
    util = require('util'),
    async = require('async'),
    utils = require('./utils'),
    Report = require('./report'),
    jsdom = require("jsdom");

var bindChannel = function(options){
    this.channel = channelLibrary.getChannel(options.protocol || 'HTTP', {
        port: options.port,
        debug: false, //options.debug,
        key: options.key
    });
};

var log = function(_){
    if(this.debug) {
        console.log.apply(console, arguments);
    }
};

function isReportReady (report){
    var k;
    for (k in report){
        if(report.hasOwnProperty(k)){
            if(!report[k].isReady()) {
                return false;
            }
        }
    }
    return true;
}

var Events = {
    REPORT_READY: 'report_ready'
};

var Master = function(options){
    options = options || {};
    bindChannel.call(this, options);
    this.probes = options.probes || [];
    this.hosts = options.hosts || [];
    this.activeReport = {};
    this.debug = options.debug;
    this.me = options.me;
};

//Master is an EventEmitter: emits an event when report is ready
util.inherits(Master, EventEmitter);

Master.prototype.log = log;

Master.prototype.createReport = function(){
    var self = this,
        tasks = [];

    self.activeReport = {};

    self.probes.forEach(function(p){
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

Master.prototype.start = function(){
    var self = this;

    self.channel.start();
    self.channel.on(ChannelEvents.REQUEST, function(data){
        return;

        if(/report$/.test(data.originalUrl)) {
            //This is the master.
            //Issuing any request to it should just trigger
            //it, for now.
            self.createReport();
        } else if(/latest$/.test(data.originalUrl)) {
            console.log(self.activeReport);
        }
    });

    self.channel.on(ChannelEvents.ACK, function(response){
        self.activeReport[response.uuid] = self.activeReport[response.uuid] || new Report();
        self.activeReport[response.uuid].addProbeReport({
            uuid: response.uuid,
            ack: true
        });
    });
    self.channel.on(ChannelEvents.NACK, function(response){
        self.activeReport[response.uuid] = self.activeReport[response.uuid] || new Report();
        self.activeReport[response.uuid].addProbeReport({
            uuid: response.uuid,
            ack: false
        });
    });
    self.channel.on(ChannelEvents.MESSAGE, function(message){
        if(message.data && message.data.report) {
            self.log('Got Report');
            var reportRow = self.activeReport[message.uuid] = self.activeReport[message.uuid] || new Report();
            reportRow.addProbeReport(message.data.report);

            if(isReportReady(self.activeReport)) {
                self.emit(Events.REPORT_READY, self.activeReport);
                // Object.keys(self.activeReport).forEach(function(k){
                //     self.log(JSON.stringify(self.activeReport[k].dump()));
                // });
            }
        }
    });
};

var Probe = function(options){
    options = options || {};
    this.debug = options.debug;
    this.region = options.region;
    bindChannel.call(this, options);
};

Probe.prototype.start = function(){
    var self = this;

    self.channel.start();

    self.channel.on(ChannelEvents.COMMAND, function(command){
        self.log('Got command with ' + command.uuid);
        self.log('Data: ', command.data);

        var url = command.data.url,
            selector = command.data.selector,
            master = command.data.master;

        jsdom.env(
            url,
            function (errors, window) {
                if (errors) {

                    return;
                }
                var elements = window.document.querySelectorAll(selector);
                self.log('<' + url + '> selector ' + selector + ' matched ' + elements.length + ' elements');
                self.channel.send(master, {
                    report: {
                        url: url,
                        selector: selector,
                        code: 200,
                        matched: (elements.length > 0),
                        region: self.region
                    }
                }, command.uuid);
            }
        );
    });
};

Probe.prototype.log = log;

module.exports = {
    Master: Master,
    Probe: Probe,
    Events: Events
};