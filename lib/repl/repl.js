var repl = require('repl'),
    Eye = require('../nodes/eye');

var EYE_PORT = 3030,
    KEY = 'repl-3030';

function Envrironment(){
    this.eye = false;
}

Envrironment.prototype.addEye = function(){
    if(this.eye) {
        return;
    }
    this.eye = new Eye({
        debug: false,
        port: EYE_PORT,
        key: KEY
    });
    this.eye.start();
};

var env = new Envrironment();

var context = repl.start({
    prompt: "cloudeyes $ ",
    input: process.stdin,
    output: process.stdout,
}).context;

context.eye = function(){
    env.addEye();
};