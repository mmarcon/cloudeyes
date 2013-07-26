module.exports = function(){
    return function(req, res, next){
        res.json = function(object, statusCode){
            statusCode = statusCode || 200;
            res.writeHead(statusCode, {
                'Content-Type': 'application/json'
            });
            res.end(JSON.stringify(object));
        };
        next();
    };
};