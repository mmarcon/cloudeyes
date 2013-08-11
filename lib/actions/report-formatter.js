var Q = require('q'),
    Formatter = require('../reporting/report-formatter');

var ReportFormatter = function(targetObject){
    var deferred = Q.defer(),
        report = targetObject.report,
        formatter = new Formatter(report);

    targetObject.plain = JSON.stringify(report);
    targetObject.html = formatter.html();

    deferred.resolve(targetObject);
};

module.exports = ReportFormatter;