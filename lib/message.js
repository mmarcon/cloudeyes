
var Message = {};

Message.type = {};
Message.type.ACK = 'ACK';
Message.type.NACK = 'NACK';
Message.type.MESSAGE = 'MESSAGE';
Message.type.COMMAND = 'COMMAND';
Message.type.UNKNOWN = 'UNKNOWN';

Message.status = {};
Message.status.OK = 0;
Message.status.ERROR = 1;

Message.ACK = function(data){
    return {
        status: Message.status.OK,
        type: Message.type.ACK,
        data: data
    };
};

Message.NACK = function(data){
    return {
        status: Message.status.ERROR,
        type: Message.type.NACK,
        data: data
    };
};

Message.message = function(data, key, uuid){
    return {
        status: Message.status.OK,
        type: Message.type.MESSAGE,
        data: data,
        key: key,
        uuid: uuid
    };
};

Message.command = function(data, key, uuid){
    return {
        status: Message.status.OK,
        type: Message.type.COMMAND,
        data: data,
        key: key,
        uuid: uuid
    };
};

module.exports = Message;