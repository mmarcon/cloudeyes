var Node = require('./node');

function init(config) {
    var node = new Node.Probe({
        port: process.env.PORT,
        debug: true,
        key: config.key,
        region: process.env.REGION
    });
    node.start();
    return node;
}

module.exports = {
    init: init
};