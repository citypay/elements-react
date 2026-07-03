const cors = require('cors');
const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');
const { randomUUID } = require('crypto');
const { CityPay } = require("@citypay/sdk")

const cfg = require("./config")

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: cfg.CORS_REGEX
}));

const cityPay = new CityPay(cfg.CP_CLIENT_ID, cfg.CP_LICENSE_KEY, {sandbox: true})

const handleError = (res, label, err, status = 500) => {
  console.error(`${label}:`, err);

  return res.status(status).json({
    error: label,
    message: err?.message || 'Unknown error'
  });
};

// Routes
app.get("/ping", (req, res) => {
  res.send("pong");
});

app.get('/payment-session', (req, res) => {
  cityPay.paymentIntents.create({
    merchantid: Number(cfg.CP_MID),
    amount: 1001,
    currency: 'GBP',
    identifier: `cart-${randomUUID()}`,
    billTo: {
      title: 'Mr',
      firstname: 'N',
      lastname: 'Person',
      email: 'n.person@example.com',
      address1: '123 Example Street',
      address2: 'Example City',
      address3: 'Example County',
      country: 'GB',
      postcode: 'JE3 3QA'
    }
  }, {})
    .then((response) => {
      res.json(response);
    })
    .catch((err) => {
      handleError(res, 'Failed to create payment session', err);
    });
});

app.post('/authorise', (req, res) => {
  const { intentId } = req.body;

  if (!intentId) {
    return res.status(400).json({ error: 'Missing intentId' });
  }

  cityPay.paymentIntents.authorise({
    payment_intent_id: intentId
  })
    .then((response) => {
      res.json(response);
    })
    .catch((err) => {
      handleError(res, 'Failed to authorise payment', err);
    });
});

app.post('/verify-auth', (req, res) => {
  const { intentId } = req.body;

  if (!intentId) {
    return res.status(400).json({
      status: 'error',
      error: 'Missing intentId'
    });
  }

  cityPay.paymentIntents.verifyAuthorised({
    unmask_fields: [],
    payment_intent_id: intentId
  })
    .then((response) => {
      res.json(response);
    })
    .catch((err) => {
      handleError(res, 'Failed to verify authorisation', err);
    });
});

// Start server
const key = fs.readFileSync(path.resolve(__dirname, '../certs/localhost-key.pem'));
const cert = fs.readFileSync(path.resolve(__dirname, '../certs/localhost.pem'));

https
  .createServer({ key, cert }, app)
  .listen(cfg.PORT, cfg.HOSTNAME, () => {
    console.log(`[cp-demo] Backend listening on https://${cfg.HOSTNAME}:${cfg.PORT}`)
  });