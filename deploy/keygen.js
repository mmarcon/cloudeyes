#!/usr/bin/env node
var utils = require('../lib/utils.js');

//Convenience script to generate random keys to be used
//in production.
utils.key(24, function(key){
    console.log(key);
});