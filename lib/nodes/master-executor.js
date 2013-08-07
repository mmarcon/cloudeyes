var Master = require('./master');

var master;

function execute(options) {
    if(master) {
        return;
    }

    master = new Master(options);
    master.on(Master.Events.REPORT_READY, function(report){
        console.log(report);
    });
}


module.exports = {
    execute: execute
};