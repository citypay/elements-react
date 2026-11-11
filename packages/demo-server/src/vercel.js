const { CityPay } = require('@citypay/sdk');
const { createHandlers } = require('./handlers');

let handlers;

function getHandlers() {
  if (!handlers) {
    const { EX_CP_CLIENT_ID, EX_CP_LICENSE_KEY, EX_CP_MID } = process.env;
    if (!EX_CP_CLIENT_ID || !EX_CP_LICENSE_KEY || !EX_CP_MID) {
      throw new Error('Missing sandbox configuration');
    }
    handlers = createHandlers(
      new CityPay(EX_CP_CLIENT_ID, EX_CP_LICENSE_KEY, { sandbox: true }),
      EX_CP_MID
    );
  }
  return handlers;
}

function createVercelHandler(method, name, resolveHandlers = getHandlers) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== method) {
      res.setHeader('Allow', method);
      return res.status(405).json({ error: 'Method not allowed' });
    }

    let routeHandlers;
    try {
      routeHandlers = resolveHandlers();
    } catch {
      console.error('[cp-demo] Sandbox configuration unavailable');
      return res.status(503).json({ error: 'Sandbox unavailable' });
    }

    try {
      return await routeHandlers[name](req, res);
    } catch {
      console.error('[cp-demo] Unexpected backend failure');
      return res.status(500).json({ error: 'Backend request failed' });
    }
  };
}

module.exports = { createVercelHandler };
