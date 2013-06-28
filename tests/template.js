var ReportFormatter = require('../lib/report-formatter');

var report = {
    "edcb1c04-de4f-cc24-7a67-7fe187d82832": {
        "report": {
            "ack": true,
            "uuid": "edcb1c04-de4f-cc24-7a67-7fe187d82832",
            "url": "http://beyondpasta.com",
            "selector": "#footer",
            "code": 200,
            "matched": true,
            "region": "us"
        }
    },
    "2386af90-2328-300c-0399-4a9d4a1dad6a": {
        "report": {
            "ack": true,
            "uuid": "2386af90-2328-300c-0399-4a9d4a1dad6a",
            "url": "http://beyondpasta.com",
            "selector": "#footer",
            "code": 200,
            "matched": true,
            "region": "asia"
        }
    },
    "9e391846-4bbd-fc68-2feb-540d59513e24": {
        "report": {
            "ack": true,
            "uuid": "9e391846-4bbd-fc68-2feb-540d59513e24",
            "url": "http://marcon.me",
            "selector": "h2.resume-section",
            "code": 200,
            "matched": true,
            "region": "us"
        }
    },
    "7a4ef014-e5b0-4ef7-9681-7bea7c414bbc": {
        "report": {
            "ack": true,
            "uuid": "7a4ef014-e5b0-4ef7-9681-7bea7c414bbc",
            "url": "http://marcon.me",
            "selector": "h2.resume-section",
            "code": 200,
            "matched": true,
            "region": "asia"
        }
    },
    "a08abd78-faf2-07eb-3d7b-23704735e937": {
        "report": {
            "ack": true,
            "uuid": "a08abd78-faf2-07eb-3d7b-23704735e937",
            "url": "http://toys.marcon.me",
            "selector": ".monkey",
            "code": 200,
            "matched": false,
            "region": "us"
        }
    },
    "5fa86467-b267-e9b6-207e-773d9acb4dc8": {
        "report": {
            "ack": true,
            "uuid": "5fa86467-b267-e9b6-207e-773d9acb4dc8",
            "url": "http://toys.marcon.me",
            "selector": ".monkey",
            "code": 200,
            "matched": false,
            "region": "asia"
        }
    }
};

var formatter = new ReportFormatter(report);
console.log(formatter.html());