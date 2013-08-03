var Node = require('./node'),
    util = require('util'),
    ChannelEvents = require('../channel').Events,
    Actions = require('../actions'),
    Action = Actions.Action,
    HTTPAnalyzer = Actions.HTTPAnalyzer,
    DOMAnalyzer = Actions.DOMAnalyzer;

var Eye = function(options){
    Node.call(this, options);
    this.region = options.region;
};

util.inherits(Eye, Node);

Eye.prototype.start = function(){
    var self = this,
        boundNotifyMaster = self.notifyMaster.bind(self);
    self._start();
    self.channel.on(ChannelEvents.COMMAND, function(command){
        //We always notify the master, no matter if the promise is resolved or rejected
        Action.with(command.data)
            .then(HTTPAnalyzer)
            .then(DOMAnalyzer)
            .done(boundNotifyMaster, boundNotifyMaster);
    });
};

Eye.prototype.notifyMaster = function(report){
    //Clean up the report and send it over the wire
    this.channel.send(report.master, {
        report: {
            url: report.url,
            selector: report.selector,
            reachable: report.reachable,
            code: report.code,
            matched: report.matched,
            region: this.region
        }
    });
};

module.exports = Eye;