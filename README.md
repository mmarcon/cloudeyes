![logo](https://raw.github.com/mmarcon/cloudeyes/master/media/logo.png)

[![Build Status](https://travis-ci.org/mmarcon/cloudeyes.png?branch=master)](https://travis-ci.org/mmarcon/cloudeyes)

#Cloudeyes 

Cloudeyes is a simple distributed system to observe whether a host – typically a website – is reachable from different locations at the same time. This helps spotting issues related to DNS, CDN and with most other acronyms.

The rationale behind this little project is that I need to monitor a few websites that I own, I don't have the need for a professional (as in *that costs money*) service and finally I believe coding this kind of things can be fun.

I want to be able to make sure one or more websites are reachable from different part of the world. Conveniently, there are several cloud providers and *PaaS* providers that allow users to pick where their application will be deployed. Amazon, for instance, has different datacenters to choose from for their AWS service.


##Architecture

The architecture, will probably look like this:

    [PROBE 1]   [PROBE 2]   [PROBE 3]  …  [PROBE N]
        |           |           |             |
        |___________|___________|_____________|
        |
    [MASTER]

**MASTER** connects to each of the **PROBES** (running on nodes located in different regions) and requests them to connect to a URL and verify whether the expected webpage is loaded (i.e. check if HTML element specified via CSS selector is present).

The requested test is added to a queue and then executed, to support the possibility for a PROBE to be part of multiple clusters or to have the MASTER request multiple tests in sequence.

Once a test is completed, PROBES report back to the MASTER node.

##Protocols

For simplicity of deployment, nodes will talk via a HTTP(S) based protocol. The MASTER will authenticate itself with the PROBES by including a special *key* in the body of the request along with the other data, and will attach a *request ID* to each request.

When PROBES are done with running the requested test, they will contact the MASTER with another HTTP(S) request reporting on the result, attaching the request ID.

HTTP is not the most efficient protocol for this type of request-response exchange between MASTER and PROBES. However it allows to deploy this type of infrastructure to free or cheap PaaS that are meant for web applications, where ports 80 and 443 are to only open ports available for an application.

A more efficient, TCP (or UDP) based protocol will be provided in the future for infrastructure where custom ports and protocols are available.

### HTTP Protocol

When HTTP is selected as the protocol, all the communication happens through JSON messages. Requests use the `POST` method and the JSON payload is added to the request body.

Note that the message exchange happens in 2 phases. MASTER opens a connection to a PROBE, and sends a *command*. PROBE responds with `ACK` or `NACK`.

`ACK` is sent when the received command can be correctly parsed, it is a recognized command, and MASTER has sent it along with an authorized key.

`NACK` is sent otherwise. In special error cases such as unauthorized keys the `NACK` response includes details on the error.

Example of *rich* `NACK`:

    {
        status: 1,
        type: "NACK",
        data: "Invalid Key"
    }

Note the field `status`. That is mostly there for future use. Normally `status` is always `1`.

    [REQ]  MASTER  === COMMAND ===> PROBE
    [RES]  MASTER <=== (N)ACK  ===  PROBE

       ........ PROBE EXECUTES TEST ........

           MASTER <===   MSG   ===  PROBE [REQ]
           MASTER  === (N)ACK  ===> PROBE [RES]

This way of doing things seems like an unnecessary overhead in terms of number of requests. In fact the rationale is that this way the system scales better. PROBEs could potentially be used by several MASTERs, which might request a high number of tests. With the protocol implemented this way, each MASTER requests a report, gets the `ACK` and closes the connection. This means that there is no open socket while the job is performed, and no client waiting for the job to be completed.

The advantages of this solution are:

 1. it is easy to implement a queueing system that handles a big number of requests to be performed in each PROBE
 2. it is easy to implement QoS strategies and do service differentiation between premium and non premium customers, if ever needed.

### Other Protocols

Other protocols to handle communication between nodes (e.g. TCP, UDP) are not yet implemented and are not part of this specification.

## Deployment

The first deployment of **Cloudeyes** will be done on [AppFog](http://appfog.com). They have a great, forever free plan that has everything that is needed:

 * Free plan
 * AWS deployment, with possibility of choosing between AWS Asia Southeast, AWS Europe West and AWS US East data centers.
 * Supports *cron jobs* via [node-cron](https://github.com/ncb000gt/node-cron): cron is used to trigger a report creation on the MASTER.
 * Works great with [emailjs](https://github.com/eleith/emailjs) that is used to email the resulting reports to the *administrator*.

## Configuration
PROBES are just deployed to nodes located in different regions with a minimal configuration – in fact the only thing they need is the key that is shared with a MASTER. PROBES remain idle until a MASTER sends a `run test` command.

The MASTER is the active player. It can be deployed anywhere, as long as it is possible to reach it via a HTTP connection.

MASTER and PROBES need to be configured with a pre-shared key: this way PROBES will only accept commands from a legitimate MASTER and the MASTER will accept only messages from legitimate PROBES. Keys are enforced at the *channel* level (`channel.js`).

The best way to deploy nodes along with their configuration is to provide a `config.json` file in the root of the directory structure in the same way it was done in this repository. `config.json` looks like this:

	{
	    "key": "aaa-bbb-ccc-ddd-eee-fff",
	    "hosts": [
	        {
	            "url": "http://beyondpasta.com",
	            "selector": "#footer"
	        },
	        {
	            "url": "http://marcon.me",
	            "selector": "h2.resume-section"
	        },
	        {
	            "url": "http://toys.marcon.me",
	            "selector": ".monkey"
	        }
	    ],
	    "probes": [
	        {
	            "id":"p0",
	            "host": "localhost",
	            "port": 3001
	        },
	        {
	            "id":"p1",
	            "host": "localhost",
	            "port": 3002
	        }
	    ],
	    "recipients": [
	        "me@marcon.me"
	    ]
	}

Note that while this is a complete configuration and everything is required to bootstrap a MASTER node, **PROBES only need the** `key` **property**.

All these messy manual steps will at some point hopefully go away and will be replaced with some sort of automated process.

Enjoy :)
