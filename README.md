# Windcave Mock Server

Provides:

* Session creation API
* Hosted payment page, with success or failure triggers (to replicate success or failure with Windcave)
* Session lookup api.

## Other things

* Runs on port 2999 by default. change by setting the PORT env var

## Make it go

* clone the repo
* `npm i`
* `npm start`

Where ever you need windcave api - change api url to the accessible url of this server.
