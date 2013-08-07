var Eye = require('../../lib/nodes/eye');

//Get a picture of the environment
var HOST = process.env.HOST,
    PORT = process.env.PORT,
    NODE_TYPE = process.env.NODE_TYPE,
    REGION = process.env.REGION,
    KEY = 'dev-key';

if(NODE_TYPE === 'master') {
    //Then I need to make a master node
    console.log(HOST);
}
else {
    //Well, it's an eye
    var Eye = new Eye({
        debug: true,
        port: PORT,
        key: KEY,
        region: REGION,
        alwaysUseDefaultPorts: false
    });
    Eye.start();
}