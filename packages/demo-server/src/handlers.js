const { randomUUID } = require('node:crypto');

function createHandlers(cityPay, merchantId) {
  function fail(res, label) {
    console.error(`[cp-demo] ${label}`);
    return res.status(500).json({ error: label, message: 'Sandbox request failed' });
  }

  return {
    ping(req, res) {
      res.send('pong');
    },

    async paymentSession(req, res) {
      try {
        const session = await cityPay.paymentIntents.create({
          merchantid: Number(merchantId),
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
        }, {});
        res.json(session);
      } catch {
        fail(res, 'Failed to create payment session');
      }
    },

    async authorise(req, res) {
      const intentId = req.body?.intentId;
      if (!intentId) return res.status(400).json({ error: 'Missing intentId' });

      try {
        const result = await cityPay.paymentIntents.authorise({ payment_intent_id: intentId });
        res.json(result);
      } catch {
        fail(res, 'Failed to authorise payment');
      }
    },

    async verifyAuth(req, res) {
      const intentId = req.body?.intentId;
      if (!intentId) return res.status(400).json({ status: 'error', error: 'Missing intentId' });

      try {
        const result = await cityPay.paymentIntents.verifyAuthorised({
          unmask_fields: [],
          payment_intent_id: intentId
        });
        res.json(result);
      } catch {
        fail(res, 'Failed to verify authorisation');
      }
    }
  };
}

module.exports = { createHandlers };
