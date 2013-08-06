var Q = require('q');

//Example of desired report
//
// | UUID request | ACKNOWLEDGED | URL               | SELECTOR | RESPONSE CODE | MATCHED | REGION |
// | 123-456-7890 | true         | http://google.com | body     | 200           | true    | asia   |
// | H63-G7R-7X32 | true         | http://marcon.me  | .content | 200           | false   | us     |
// | AA3-4F6-7DE0 | false        |                   |          |               |         |        |

//What comes in:
//{uuid: 123-456-7890}
//{uuid: 123-456-7890, reachable: false}
//{uuid: 123-456-7890, ack: true|false, reachable: true}
//{uuid: 123-456-7890, url: 'http://google.com', selector: 'body', code: 200, matched: true, region: 'asia'}

var Report = function(){
    this.rows = [];
    this.rowIndexes = {};
    this.promise = null;
    this.timestamp = null;
};

//Row (indexed by uuid):
// {
//     uuid: <String>, //immediately
//     reachable: <Boolean>,
//     acknowledges: <Boolean>,
//     url: <String>,
//     code: <Number>,
//     selector: <String>,
//     matched: <Boolean>,
//     region: <String>,
//     timestamp: <Number>,
//     deferred: <Q.defer()> //immediately
// }

Report.prototype.newRow = function(uuid){
    this.rowIndexes[uuid] = this.rows.push({
        uuid: uuid,
        deferred: Q.defer()
    }) - 1;
};

//immediately after all the rows
//have been initialized
//call this so the *big promise* gets created.
Report.prototype.ready = function(){
    var self = this,
        all = Q.all(this.rows.map(function(r){
            return r.deferred.promise;
        }));
    self.promise = all.then(function(report){
        self.timestamp = Date.now();
        return report;
    });
};
Report.prototype.newDataForRow = function(uuid, data){
    var row = this.rows[this.rowIndexes[uuid]];
    Object.keys(data).forEach(function(k){
        if(k === 'deferred') {
            return;
        }
        row[k] = data[k];
    });
};
Report.prototype.closeRow = function(uuid){
    var row = this.rows[this.rowIndexes[uuid]];
    row.timestamp = Date.now();
    row.deferred.resolve(this);
};

module.exports = Report;