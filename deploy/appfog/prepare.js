var setup = require('./setup.json'),
    exec = require('child_process').exec;

var COMMANDS = {
    main: 'af',
    env: function(app, variable, value){
        return [COMMANDS.main, 'env-add', app, variable + '=' + value].join(' ');
    },
    update: function(app){
        return [COMMANDS.main, 'update', app].join(' ');
    }
};

var key = setup.key;

//Setup the master first
var master = setup.master;
exec(COMMANDS.env(master.name, 'NODE_TYPE', 'master'), function(error, stdout, stderr){
    var std = stdout || stderr;
    console.log(std);
});
exec(COMMANDS.env(master.name, 'KEY', key), function(error, stdout, stderr){
    var std = stdout || stderr;
    console.log(std);
});
exec(COMMANDS.env(master.name, 'KEY', key), function(error, stdout, stderr){
    var std = stdout || stderr;
    console.log(std);
});
exec(COMMANDS.update(master.name), {cwd: '..'}, function(error, stdout, stderr){
    var std = stdout || stderr;
    console.log(std);
});

//Now the eyes
var eyes = setup.eyes;
eyes.forEach(function(eye){
    exec(COMMANDS.env(eye.name, 'NODE_TYPE', 'eye'), function(error, stdout, stderr){
        var std = stdout || stderr;
        console.log(std);
    });
    exec(COMMANDS.env(eye.name, 'KEY', key), function(error, stdout, stderr){
        var std = stdout || stderr;
        console.log(std);
    });
    exec(COMMANDS.update(eye.name), {cwd: '..'}, function(error, stdout, stderr){
        var std = stdout || stderr;
        console.log(std);
    });
});