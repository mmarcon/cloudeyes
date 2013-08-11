var Master = require('./master'),
    CronJob = require('cron').CronJob;

var master;

function onreport(report){
    require('fs').writeFile('reports.json', JSON.stringify(report, null, 4), function(){
        console.log('done');
    });
    //Do something useful here
}

function execute(options) {
    if(master) {
        return;
    }

    master = new Master(options);

    var job = new CronJob({
        cronTime: options.time,
        onTick: function(){
            master.createReport();
        }
    });

    master.on(Master.Events.REPORT_READY, onreport);

    master.start();
    job.start();
}


module.exports = {
    execute: execute
};