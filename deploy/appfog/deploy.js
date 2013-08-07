var setup = require('./setup.json'),
    CLIExecutor = require('../utils/cli-executor');

//TODO:
//
// * add CLI parameters:
//   1. --skip-env
//   2. --master
//   3. --eyes
//   4. -node <name>

var COMMANDS = {
    main: 'af',
    env: function(app, variable, value){
        return [COMMANDS.main, 'env-add', app, variable + '=' + value].join(' ');
    },
    update: function(app){
        return [COMMANDS.main, 'update', app].join(' ');
    }
};

var executor = new CLIExecutor();

var key = setup.key;

//Setup the master first
var master = setup.master;
executor.exec(COMMANDS.env(master.name, 'NODE_TYPE', 'master'));
executor.exec(COMMANDS.env(master.name, 'KEY', key));
executor.exec(COMMANDS.update(master.name), {cwd: '../..'});

//Now the eyes
var eyes = setup.eyes;
eyes.forEach(function(eye){
    executor.exec(COMMANDS.env(eye.name, 'NODE_TYPE', 'eye'));
    executor.exec(COMMANDS.env(eye.name, 'KEY', key));
    executor.exec(COMMANDS.update(eye.name), {cwd: '../..'});
});

executor.start();