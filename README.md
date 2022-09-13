# Windcave Mock Server

This will let you keep working when windcave UAT is busted. (Which seems to be quite frequently)

What you get:

* Session creation API (POST /sessions)
    * Includes apprpriately formatted links for an internally hosted, hosted payment page
* Session lookup api. (GET /sessions/{sessionId})
* Hosted payment page, with success or failure triggers (to replicate success or failure with Windcave)
    * HPP links to 2 additional api's that can be called directly if desired (this allows the automation of test workflows) `/payment/fail?sessionId={sessionId}` and `/payment/success?sessionId={sessionId}`
    * Success and Fail api's will redirect the browser to the session's originally defined callback urls for approved/declined.
    * Success and Fail api's will call the notificaitonUrl (FPRN) internally.

## Other things

* Runs on port 2999 by default. change by setting the PORT env var

## Make it go

* clone the repo
* `npm i`
* `npm start`

Where ever you need windcave api - change api url to the accessible url of this server.

## Calling from Docker

If your calling application runs as a container in docker, and you run this server on your local machine, you will need to set your applications windcave URL to `host.docker.internal:2999` (`host.docker.internal` is a reference to  `127.0.0.1` on your local machine, but is accessible from within the container)

## Setting the Public Endpoint

If you run this server in a container, or in some sort of deployed environment, the derived `ENDPOINT` url, or the default `ENDPOINT` url may not be correct. 

You should set the Environment variable `ENDPOINT` to the url where this server/application is accessible. This value is used to build the links for the HPP that are embedded into the response from the session creation.

## Sessions

When you call POST `/sessions` the request body is stored in memory (it's appended to an array) When you subsequently query GET `/sessions/<sessionId>` that session is recalled form memory. Becasue of this simple approach, this server is not scaleable there must only be one instance that serves all the requests.

## Alternate ways of running

The main way to run, is with `npm run start` However that sets the `ENDPOINT` value to `127.0.0.1`

You can also run `node server.mjs` and have the Endpoint derived. The code will make a best effort based on the data available when the request is invoked. protocol, and host are extracted.
