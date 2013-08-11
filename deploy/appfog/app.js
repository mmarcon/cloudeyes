var Eye = require('../../lib/nodes/eye'),
    MasterExexutor = require('../../lib/nodes/master-executor'),
    config = require('./master-config.json');

//Get a picture of the environment
var PORT = process.env.VCAP_APP_PORT,
    NODE_TYPE = process.env.NODE_TYPE,
    REGION = process.env.REGION,
    KEY = process.env.KEY;

if(NODE_TYPE === 'master') {
    //Then I need to make a master node
    MasterExexutor.execute({
        eyes: config.eyes,
        hosts: config.hosts,
        me: config.endpoint,
        port: PORT, //Port we listen to is not necessarily the port where we can be reached at
        key: KEY,
        alwaysUseDefaultPorts: true,
        time: config.time //For Cron
    });
}
else {
    //Well, it's an eye
    var Eye = new Eye({
        debug: false,
        port: PORT, //Port we listen to is not necessarily the port where we can be reached at
        key: KEY,
        region: REGION,
        alwaysUseDefaultPorts: true
    });
    Eye.start();
}