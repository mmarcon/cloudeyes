var crypto = require('crypto');

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

function uuid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function key(length, callback) {
    length = length || 48;
    crypto.randomBytes(length, function(ex, buf) {
        var theKey = buf.toString('hex');
        callback(theKey);
    });
}

module.exports = {
    uuid: uuid,
    key: key
};