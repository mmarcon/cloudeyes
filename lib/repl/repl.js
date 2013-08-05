var repl = require('repl'),
    Eye = require('../nodes/eye'),
    Channel = require('../channel'),
    Events = Channel.Events;

var EYE_PORT = process.env.PORT || 3030,
    OUT_PORT = 3031,
    KEY = 'repl-3030',
    HOST = process.env.IP || 'localhost';

function Envrironment(){
    this.eye = false;
}

Envrironment.prototype.addEye = function(){
    if(this.eye) {
        return;
    }
    this.eye = new Eye({
        debug: true,
        port: EYE_PORT,
        key: KEY
    });
    this.eye.start();
};

var env = new Envrironment();
var outChannel = Channel.getChannel('HTTP', {
    debug: false,
    port: OUT_PORT,
    key: KEY
});

//Note that for a test report to be delivered to this REPL
//the REPL must be run on a node accessible via HTTP.
//Should work on Cloud9, for instance.
outChannel.start();

outChannel.on(Events.MESSAGE, function(message){
    console.log(message && message.report && JSON.stringify(message.report));
});
outChannel.on(Events.ACK, function(){
    console.log('ACK Received');
});
outChannel.on(Events.NACK, function(){
    console.log('NACK Received');
});
outChannel.on(Events.ERROR, function(){
    console.log('ERROR :(');
});

var context = repl.start({
    prompt: "cloudeyes $ ",
    input: process.stdin,
    output: process.stdout,
}).context;

context.eye = function(){
    env.addEye();
};

context.test = function(url, selector, eye) {
    eye = eye || {};
    outChannel.sendCommand(
        {
            host: eye.host || HOST,
            port: eye.port || EYE_PORT
        },
        {
            url: url,
            selector: selector,
            master: {
                host: HOST,
                port: OUT_PORT
            }
        }
    );
};