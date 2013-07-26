var config = require('./config'),
    path = require('path');

function requireLocalModule(module) {
    return require(path.join(config.basePath, module));
}

module.exports = {
    requireLocalModule: requireLocalModule
};