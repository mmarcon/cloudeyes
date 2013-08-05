var repl = require('repl'),
    Eye = require('../nodes/eye'),
    Channel = require('../channel');

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

var context = repl.start({
    prompt: "cloudeyes $ ",
    input: process.stdin,
    output: process.stdout,
}).context;

context.eye = function(){
    env.addEye();
};

context.test = function(url, selector) {
    outChannel.sendCommand({host: HOST, port: EYE_PORT}, {
        url: url,
        selector: selector,
        master: {
            host: HOST,
            port: OUT_PORT
        }
    });
};