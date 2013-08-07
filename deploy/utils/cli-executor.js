var spawn = require('child_process').spawn,
    Q = require('q');

function printout(data){
    console.log(data.toString('utf8'));
}

function CLIExecutor(){
    this.queue = [];
}

CLIExecutor.prototype.exec = function(command, options){
    this.queue.push({
        command: command,
        options: options
    });
};

CLIExecutor.prototype.start = function(ondone, onerror){
    var tasks = [];
    this.queue.forEach(function(t){
        var fn = function(){
            var deferred = Q.defer();
            console.log('running ' + t.command);
            var process = spawn(t.command, [], t.options || {});
            process.stdout.on('data', printout);
            process.stderr.on('data', printout);
            process.on('exit', function(code){
                if(code === 0) {
                    return deferred.resolve();
                }
                deferred.reject(code);
            });
            return deferred;
        };
        tasks.push(fn);
    });
    Q.all(tasks.map(function(task){
        return task();
    })).done(ondone, onerror);
};

// var ce = new CLIExecutor();
// ce.exec('ls');
// ce.exec('ls', {cwd: '..'});
// ce.start();

module.exports = CLIExecutor;