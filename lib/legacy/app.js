var Master = require('./lib/master'),
    Probe = require('./lib/probe'),
    config = require('./config');

var node;

if(process.env.NODE === 'probe') {
    node = Probe.init(config);
} else {
    node = Master.init(config);
    Master.schedule({
        time: '0 */1 * * * *'
    }, node);
}