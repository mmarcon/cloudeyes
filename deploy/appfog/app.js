var Eye = require('../../lib/nodes/eye');

//Get a picture of the environment
var HOST = process.env.VCAP_APP_HOST,
    PORT = process.env.VCAP_APP_PORT,
    NODE_TYPE = process.env.NODE_TYPE,
    REGION = process.env.REGION,
    KEY = process.env.KEY;

if(NODE_TYPE === 'master') {
    //Then I need to make a master node
    console.log(HOST);
}
else {
    //Well, it's an eye
    var Eye = new Eye({
        debug: false,
        port: PORT,
        key: KEY,
        region: REGION,
        alwaysUseDefaultPorts: true
    });
    Eye.start();
}