var Q = require('q'),
    tests = require('./tests');

function run(ondone){
    Q.all(tests.map(function(t){
        return t.run();
    })).done(function(){
        if(ondone) {
            ondone(true);
        } else {
            process.exit(0);
        }
    }, function(){
        if(ondone) {
            ondone(false);
        } else {
            process.exit(1);
        }
    });
}

module.exports = {
    run: run
};