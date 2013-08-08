var connect = require('connect'),
    EventEmitter = require('events').EventEmitter,
    util = require('util'),
    request = require('request'),
    json = require('./middleware/json'),
    Message = require('./message'),
    Utils = require('./utils');

var Events = {
    REQUEST: 'channel_request',
    ACK: 'channel_ack',
    NACK: 'channel_nack',
    ERROR: 'channel_error',
    MESSAGE: 'channel_message',
    COMMAND: 'channel_command'
};

var HTTPChannel = function(options){
    EventEmitter.call(this);
    this.key = options.key || 'development';
    this.authorizedKeys = options.authorizedKeys || [options.key];
    this.port = options.port || 3000;
    this.channel = false;
    this.debug = options.debug;
    this.options = options;
};

util.inherits(HTTPChannel, EventEmitter);

HTTPChannel.prototype.start = function(){
    this.log('Binding to port ' + this.port);
    this.channel = connect()
        .use(connect.bodyParser())
        .use(connect.logger('dev'))
        .use(json())
        //Use the local listener function as a middleware
        .use(listen.bind(this)).listen(this.port);
};

//Private
var listen = function(req, res){
    var receivable;
    this.emit(Events.REQUEST, req);

    receivable = this.receive(req);
    if(receivable === true){
        this.sendACK(res);
    } else {
        this.sendNACK(res, receivable);
    }
};

HTTPChannel.prototype.log = function(){
    if(this.debug) {
        console.log.apply(console, arguments);
    }
};

//Handles **signaling**.
//When a node sends any message to another node,
//if all these conditions are verified:
//
// 1. the send is successful
// 2. no generic errors happen
// 3. the receiveir can correctly parse the message
//
//then a ACK message is sent back.
//
//`ensureACK` checks whether a request is correctly
//acknowledged and notifies the sender on the result via
//events.
var getACKManager = function(uuid, recipientId, context){
    return function ensureACK(error, response, responseBody) {
        if(error) {
            return this.emit(Events.ERROR, responseBody);
        }
        var type = responseBody.type,
            status = responseBody.status;

        responseBody.uuid = uuid;
        responseBody.recipient = recipientId;

        if(status === Message.status.OK) {
            if(type === Message.type.ACK) {
                return this.emit(Events.ACK, responseBody);
            } else if(type === Message.type.NACK) {
                return this.emit(Events.NACK, responseBody);
            }
        }
        return this.emit(Events.ERROR, responseBody);
    }.bind(context);
};

//When `uuid` is included, it means that this message is in
//response to the message/command with the passed `uuid`.
HTTPChannel.prototype.send = function(recipient, object, uuid){
    if(this.options.alwaysUseDefaultPorts) {
        recipient.port = 80;
    }
    this.log('Sending message to ', recipient);
    uuid = uuid || Utils.uuid();
    var options = {
        method: 'POST',
        uri: 'http://' + recipient.host + ':' + recipient.port,
        json: Message.message(object, this.key, uuid)
    };
    request(options, getACKManager(uuid, recipient.id, this));
    return uuid;
};

//When `uuid` is included, it means that this command is in
//response to the message/command with the passed `uuid`.
HTTPChannel.prototype.sendCommand = function(recipient, object, uuid){
    if(this.options.alwaysUseDefaultPorts) {
        recipient.port = 80;
    }
    this.log('Sending command to ', recipient);
    uuid = uuid || Utils.uuid();
    var options = {
        method: 'POST',
        uri: 'http://' + recipient.host + ':' + recipient.port,
        json: Message.command(object, this.key, uuid)
    };
    request(options, getACKManager(uuid, recipient.id, this));
    return uuid;
};

var handleMessage = function(message){
    this.log('Received message', message);
    this.emit(Events.MESSAGE, message);
    return true;
};
var handleCommand = function(command){
    this.log('Received command', command);
    this.emit(Events.COMMAND, command);
    return true;
};

var isAuthorized = function(payload){
    this.log("KEY", payload.key);
    if(this.authorizedKeys.indexOf(payload.key) > -1) {
        this.log('Node authorized with key ' + payload.key);
        return true;
    } else {
        this.log('Node NOT authorized with key ' + payload.key);
        return {
            meta: 'Invalid Key',
            code: 403
        };
    }
};

//Receives and parses messages from other nodes. Note that
//ACKs and NACKs **never go through here**, as a design choice.
//This also means that status – when at all set, will always be
//`Message.status.OK` here.
//
//Returns `true` if everything is OK, `false` or an `error object`
//otherwise.
HTTPChannel.prototype.receive = function(req){
    var type = req.body.type || Message.type.UNKNOWN,
        authorized = isAuthorized.call(this, req.body);

    if(authorized !== true) {
        return authorized;
    }

    switch(type) {
    case Message.type.MESSAGE:
        return handleMessage.call(this, req.body);
    case Message.type.COMMAND:
        return handleCommand.call(this, req.body);
    case Message.type.UNKNOWN:
        return false;
    default:
        //Even more unknown!!
        return false;
    }
};

HTTPChannel.prototype.sendACK = function(res){
    res.json(Message.ACK());
};

HTTPChannel.prototype.sendNACK = function(res, error){
    error = error || {};
    error.meta = error.meta || 'Generic Error';
    error.code = error.code || 500;
    res.json(Message.NACK(error.meta), error.code);
};

module.exports = {
    getChannel: function(protocol, options){
        if(protocol === 'HTTP') {
            return new HTTPChannel(options || {});
        } else {
            throw new Error(protocol + ' not supported');
        }
    },
    Events: Events
};