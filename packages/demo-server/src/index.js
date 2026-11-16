const cors = require('cors');
const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');
const express = require('express');
const { CityPay } = require('@citypay/sdk');
const cfg = require('./config');
const { createHandlers } = require('./handlers');

const app = express();
const handlers = createHandlers(
  new CityPay(cfg.CP_CLIENT_ID, cfg.CP_LICENSE_KEY, { sandbox: true }),
  cfg.CP_MID
);

app.use(express.json());
app.use(cors({ origin: cfg.CORS_REGEX }));
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

app.get('/ping', handlers.ping);
app.get('/payment-session', handlers.paymentSession);
app.post('/authorise', handlers.authorise);
app.post('/verify-auth', handlers.verifyAuth);

function methodNotAllowed(allowedMethod) {
  return (req, res) => {
    res.setHeader('Allow', allowedMethod);
    res.status(405).json({ error: 'Method not allowed' });
  };
}

app.all('/ping', methodNotAllowed('GET'));
app.all('/payment-session', methodNotAllowed('GET'));
app.all('/authorise', methodNotAllowed('POST'));
app.all('/verify-auth', methodNotAllowed('POST'));

const key = fs.readFileSync(path.resolve(__dirname, '../certs/localhost-key.pem'));
const cert = fs.readFileSync(path.resolve(__dirname, '../certs/localhost.pem'));

https.createServer({ key, cert }, app).listen(cfg.PORT, cfg.HOSTNAME, () => {
  console.log(`[cp-demo] Backend listening on https://${cfg.HOSTNAME}:${cfg.PORT}`);
});
