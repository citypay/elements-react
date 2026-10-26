const fs = require('fs');
const path = require('path');
const https = require('https');
const app = require('./app');
const cfg = require('./config');

const key = fs.readFileSync(path.resolve(__dirname, '../certs/localhost-key.pem'));
const cert = fs.readFileSync(path.resolve(__dirname, '../certs/localhost.pem'));

https
  .createServer({ key, cert }, app)
  .listen(cfg.PORT, cfg.HOSTNAME, () => {
    console.log(`[cp-demo] Backend listening on https://${cfg.HOSTNAME}:${cfg.PORT}`)
  });
