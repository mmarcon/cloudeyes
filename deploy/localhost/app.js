var Eye = require('../../lib/nodes/eye'),
    MasterExexutor = require('../../lib/nodes/master-executor'),
    config = require('./master-config.json');

//Get a picture of the environment
var PORT = process.env.PORT,
    NODE_TYPE = process.env.NODE_TYPE,
    REGION = process.env.REGION,
    KEY = process.env.KEY;

if(NODE_TYPE === 'master') {
    //Then I need to make a master node
    MasterExexutor.execute({
        debug: true,
        eyes: config.eyes,
        hosts: config.hosts,
        me: config.endpoint,
        port: PORT, //Port we listen to is not necessarily the port where we can be reached at
        key: KEY,
        time: config.time //For Cron
    });
}
else {
    //Well, it's an eye
    var Eye = new Eye({
        debug: true,
        port: PORT, //Port we listen to is not necessarily the port where we can be reached at
        key: KEY,
        region: REGION
    });
    Eye.start();
}