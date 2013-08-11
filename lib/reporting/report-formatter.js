var ejs = require('ejs'),
    fs = require('fs'),
    path = require('path'),
    templatePath = __dirname + '/../templates/email-v0.ejs',
    template = fs.readFileSync(path.normalize(templatePath), 'utf8');

var ReportFormatter = function(report){
    this.report = report;
};

ReportFormatter.prototype.table = function(raw){
    var rows = [], report = this.report;
    if(!raw) {
        //Raw table does not have header, just content
        rows.push(['Region', 'Test Performed', 'URL', 'Selector', 'Response Code', 'Selector Matched']);
    }
    Object.keys(report).forEach(function(uuid){
        var r = report[uuid].report || {/*let's be safe*/}, row = [];
        row.push(r.region, r.ack, r.url, r.selector, r.code, r.matched);
        rows.push(row);
    });
    return rows;
};
ReportFormatter.prototype.simplehtml = function(){
    var table = this.table(), html = '';
    html += '<html><head>';
    //Styles (load, perhaps)
    html += '</head><body>';
    html += '<table cellpadding="0" cellspacing="0" border="0" align="center">';
    //HEADER
    html += '<tr>';
    table.shift().forEach(function(h){
        html += '<td>' + h + '</td>';
    });
    html += '</tr>';
    //Test results
    table.forEach(function(row){
        html += '<tr>';
        row = row.map(function(cell){
            return '<td>' + cell + '</td>';
        });
        html += row.join('');
        html += '</tr>';
    });
    html += '</table>';
    html += '</body></html>';
    return html;
};

ReportFormatter.prototype.html = function(options){
    options = options || {};
    var table = this.table(), email = {};
    email.title = options.title || 'Cloudmon report';
    email.appname = options.appname || 'Cloudmon';
    email.allgood = !this.someFailed();
    email.header = table.shift();
    email.table = table;

    return ejs.render(template, {email: email});
};



ReportFormatter.prototype.pretty = function(){};
ReportFormatter.prototype.someFailed = function(){
    var table = this.table(true), failures = 0;
    table.forEach(function(test){
        if(test[4] !== 200 || !test[5]) {
            failures ++;
        }
    });
    return failures > 0;
};

module.exports = ReportFormatter;