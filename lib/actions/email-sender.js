var Q = require('q'),
    email = require("emailjs/email");


//The logic here is a bit complicated, but this action
//essentially does the following:
//
// * reads the email configuration from `targetObject`
// * for each of the recipients in the configuration sends the email
//   using a `Q.defer()` to record whether the email was sent or not
// * waits for all the emails to be sent (or failed to be sent)
// * resolves the main deferred if all emails where successful, passes
//   arrays with successful/failed emails via the `targetObject`
// * rejects the main deferred if none of the email was successfully sent,
//   passes arrays with successful/failed emails via the `targetObject`
var DOMAnalyzer = function(targetObject){
    var emailserver = targetObject.emailserver,
        plain = targetObject.plain,
        html = targetObject.html,
        from = targetObject.from,
        subject = targetObject.subject,
        recipients = targetObject.recipients instanceof Array ? targetObject.recipients : [targetObject.recipients];

    var deferred = Q.defer();
    
    var server  = email.server.connect({
        user: emailserver.user,
        password: emailserver.password,
        host: emailserver.host,
        ssl: emailserver.ssl || false
    });
    var promises = recipients.map(function(recipient){
        var singleDeferred = Q.defer();
        server.send(
            {
                text:    plain,
                from:    from,
                to:      recipient,
                subject: subject,
                attachment: [
                    {data: html, alternative:true}
                ]
            },
            function(err, message) {
                if(err) {
                    return singleDeferred.reject(recipient);
                }
                singleDeferred.resolve(recipient);
                return message;
            }
        );
        return singleDeferred.promise;
    });
    
    Q.allSettled(promises).then(function(results){
        var successfulEmails = [], failedEmails = [];
        results.forEach(function(result) {
            if (result.state === "fulfilled") {
                successfulEmails.push(result.value);
            } else {
                failedEmails.push(result.reason);
            }
        });
        targetObject.successfulEmails = successfulEmails;
        targetObject.failedEmails = failedEmails;
        if(successfulEmails.length > 0){
            deferred.resolve(targetObject);
        } else {
            deferred.reject(targetObject);
        }
    });

    return deferred.promise;
};

module.exports = DOMAnalyzer;