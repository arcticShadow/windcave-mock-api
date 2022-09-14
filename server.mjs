import path from 'node:path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { checkSchema, validationResult } from 'express-validator';
import getTransaction from './transaction.mjs';
import sessionsPostSchema from './sesisonSchema.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express()

app.use(cors())
app.use(express.json())

const sessions = {}

app.post('/sessions', checkSchema(sessionsPostSchema), function (req, res, next) {
  try {
    console.trace('session created')
    const sessionId = Math.random().toString().slice(2).padStart(32, '0');
    const accessibleEndpoint = process.env.ENDPOINT ? process.env.ENDPOINT : req.protocol + '://' + req.get('host');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Save the session (into memory) 
    sessions[sessionId] = {
      request: req.body,
      state: 'init',
      links: [{
        href: accessibleEndpoint + '/hpp?sessionId=' + sessionId,
        rel: 'hpp',
        method: 'REDIRECT',
      }]
    }

    const response = {
      id: sessionId,
      state: sessions[sessionId].state,
      links: sessions[sessionId].links
    }

    res.json(response);
  } catch (e) {
    console.error('Something bad hapenned:', e.message)
    res.end();
  }
})

app.get('/sessions/:sessionId', (req, res, next) => {
  try {
    console.trace('session queried')
    const sesisonId = req.params.sessionId;
    const session = sessions[sesisonId];

    res.json({
      id: sesisonId,
      state: session.state,
      links: session.links,
      transactions: session.transactions,
      customerId: '0',
      amount: session.request.amount,
      currency: session.request.currency,
      merchantReference: session.request.merchantReference
    })
  } catch (e) {
    console.error('Something bad hapenned:', e.message)
    res.end();
  }
})

app.get('/hpp', function (req, res) {
  console.trace('hpp served')
  res.sendFile(path.join(__dirname, '/hpp.html'));
});

app.get('/payment/fail', async function (req, res) {
  try {
    const sessionId = req.query.sessionId;

    sessions[sessionId].state = 'declined';
    sessions[sessionId].transactions = [getTransaction(sessionId, false)];

    try {
      await axios.get(sessions[sessionId].request.notificationUrl + '?sessionId=' + sessionId);
    } catch (e) {
      console.log(e.message)
    }

    res.set('Location', sessions[sessionId].request.callbackUrls.declined + "?sessionId=" + sessionId);
    res.sendStatus(307)
    res.end();
  } catch (e) {
    console.error('Something bad hapenned:', e.message)
    res.end();
  }
});

app.get('/payment/success', async function (req, res) {
  try {
    const sessionId = req.query.sessionId;

    sessions[sessionId].state = 'complete';
    sessions[sessionId].transactions = [getTransaction(sessionId, true)];

    await axios.get(sessions[sessionId].request.notificationUrl + '?sessionId=' + sessionId);

    res.set('Location', sessions[sessionId].request.callbackUrls.approved + "?sessionId=" + sessionId);
    res.sendStatus(307)
    res.end();
  } catch (e) {
    console.error('Something bad hapenned:', e.message)
    res.end();
  }
});



app.listen(process.env.PORT ? process.env.PORT : 2999, function () {
  console.log('Windcave mock server')
})
