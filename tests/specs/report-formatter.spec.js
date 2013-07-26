/*global describe, it, expect*/
var testutils = require('./testutils');

var ReportFormatter = testutils.requireLocalModule('lib/report-formatter');

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

var outcome = '<!DOCTYPEhtmlPUBLIC"-//W3C//DTDXHTML1.0Strict//EN""http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><htmlxmlns="http://www.w3.org/1999/xhtml"><head><metahttp-equiv="Content-Type"content="text/html;charset=utf-8"/><metaname="viewport"content="width=device-width,initial-scale=1.0"/><title>Cloudmonreport</title></head><body><!--Wrapper/ContainerTable:Useawrappertabletocontrolthewidthandthebackgroundcolorconsistentlyofyouremail.Usethisapproachinsteadofsettingattributesonthebodytag.--><tablecellpadding="0"cellspacing="0"border="0"id="backgroundTable"><tr><tdvalign="top"style="padding:1em"><p>Hello!<br/>HereisyourlatestCloudmonreport.</p><pstyle="color:#ff6347">Ohno,itseemssometestsfailed:(</p><!--Tablesarethemostcommonwaytoformatyouremailconsistently.Setyourtablewidthsinsidecellsandinmostcasesresetcellpadding,cellspacing,andbordertozero.Usenestedtablesasawaytospaceeffectivelyinyourmessage.--><tablecellpadding="0"cellspacing="0"border="0"class="result"><tr><tdstyle="font-weight:bold;border-bottom:1pxsolid#333;padding:.2em.5em.2em.2em;border:1pxsolid#999">Region</td><tdstyle="font-weight:bold;border-bottom:1pxsolid#333;padding:.2em.5em.2em.2em;border:1pxsolid#999">TestPerformed</td><tdstyle="font-weight:bold;border-bottom:1pxsolid#333;padding:.2em.5em.2em.2em;border:1pxsolid#999">URL</td><tdstyle="font-weight:bold;border-bottom:1pxsolid#333;padding:.2em.5em.2em.2em;border:1pxsolid#999">Selector</td><tdstyle="font-weight:bold;border-bottom:1pxsolid#333;padding:.2em.5em.2em.2em;border:1pxsolid#999">ResponseCode</td><tdstyle="font-weight:bold;border-bottom:1pxsolid#333;padding:.2em.5em.2em.2em;border:1pxsolid#999">SelectorMatched</td></tr><tr><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">us</td><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">true</td><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">http://beyondpasta.com</td><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">#footer</td><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">200</td><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">true</td></tr><tr><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">asia</td><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">true</td><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">http://beyondpasta.com</td><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">#footer</td><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">200</td><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">true</td></tr><tr><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">us</td><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">true</td><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">http://marcon.me</td><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">h2.resume-section</td><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">200</td><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">true</td></tr><tr><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">asia</td><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">true</td><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">http://marcon.me</td><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">h2.resume-section</td><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">200</td><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">true</td></tr><trstyle="color:#fff;background:#ff6347"><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">us</td><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">true</td><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">http://toys.marcon.me</td><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">.monkey</td><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">200</td><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">false</td></tr><trstyle="color:#fff;background:#ff6347"><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">asia</td><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">true</td><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">http://toys.marcon.me</td><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">.monkey</td><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">200</td><tdstyle="padding:.2em.5em.2em.2em;border:1pxsolid#999">false</td></tr></table></td></tr></table><!--Endofwrappertable--></body></html>';

describe('Report formatter', function(){
    it('formats a report to HTML', function(){
        var formatter = new ReportFormatter(report);
        expect(formatter.html().replace(/\n|\s/g, '')).toEqual(outcome);
    });
});