//Example of desired report, for each of the probes
//
// | UUID request | ACKNOWLEDGED | URL               | SELECTOR | RESPONSE CODE | MATCHED | REGION |
// | 123-456-7890 | true         | http://google.com | body     | 200           | true    | asia   |
// | H63-G7R-7X32 | true         | http://marcon.me  | .content | 200           | false   | us     |
// | AA3-4F6-7DE0 | false        |                   |          |               |         |        |

var Report = function(){
    this.report = {
        ack: null
    };
};

Report.prototype.addProbeReport = function(report){
    var thisProbeReport = this.report;

    report.uuid = report.uuid || false;
    report.url = report.url || false;
    report.selector = report.selector || false;
    report.code = report.code || 0;
    report.matched = report.matched || false;
    report.region = report.region || false;

    thisProbeReport.uuid = thisProbeReport.uuid || report.uuid;

    if (thisProbeReport.ack === null) {
        if(report.ack !== undefined) {
            thisProbeReport.ack = report.ack;
        }
    }

    thisProbeReport.url = thisProbeReport.url || report.url;
    thisProbeReport.selector = thisProbeReport.selector || report.selector;
    thisProbeReport.code = thisProbeReport.code || report.code;
    thisProbeReport.matched = thisProbeReport.matched || report.matched;
    thisProbeReport.region = thisProbeReport.region || report.region;
};

Report.prototype.isReady = function(){
    if(this.report.ack === null){
        return false;
    }

    if(this.report.code === 0){
        return false;
    }

    return true;
};

Report.prototype.dump = function(){
    return [
        this.report.uuid,
        this.report.ack,
        this.report.region,
        this.report.url,
        this.report.selector,
        this.report.code,
        this.report.matched
    ];
};

module.exports = Report;