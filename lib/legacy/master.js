var Node = require('./node'),
    CronJob = require('cron').CronJob,
    email = require("emailjs/email"),
    ReportFormatter = require('./report-formatter');


var MAIL_USER = process.env.MAIL_USER || 'none',
    MAIL_PASSWORD = process.env.MAIL_PASSWORD || 'none',
    MAIL_SENDER = process.env.MAIL_SENDER || 'Massimiliano Marcon <me@marcon.me>';


function setup(node, config){
    function reportReady(report){
        // console.log(report);
        var formatter = new ReportFormatter(report);
        var server  = email.server.connect({
           user: MAIL_USER,
           password: MAIL_PASSWORD,
           host: "smtp.gmail.com",
           ssl: true
        });
        config.recipients.forEach(function(recipient){
            server.send(
                {
                    text:    JSON.stringify(formatter.table(), null, 4),
                    from:    MAIL_SENDER,
                    to:      recipient,
                    subject: "Cloudmon Report - " + Date(),
                    attachment: [
                        {data: formatter.html(), alternative:true}
                    ]
                },
                function(err, message) {
                    if(err) {
                        console.log('Error while sending email to <' + recipient + '>', err);
                        return;
                    }
                    console.log('Email sent to <' + recipient + '>');
                }
            );
        });
    }
    node.on(Node.Events.REPORT_READY, reportReady);
}

function init(config) {
    var node = new Node.Master({
        port: process.env.PORT,
        debug: true,
        key: config.key,
        probes: config.probes,
        hosts: config.hosts,
        me: {
            host: process.env.HOST,
            port: process.env.PORT
        }
    });
    setup(node, config);
    node.start();
    return node;
}

function schedule(options, node){
    var job = new CronJob({
        cronTime: options.time,
        onTick: function() {
            node.createReport();
        },
        start: false
    });
    job.start();
}

module.exports = {
    init: init,
    schedule: schedule
};