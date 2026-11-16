const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createHandlers } = require('./handlers');
const { createVercelHandler } = require('./vercel');

function response() {
  return {
    headers: {},
    statusCode: 200,
    setHeader(name, value) { this.headers[name] = value; return this; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    send(body) { this.body = body; return this; }
  };
}

function setup() {
  const calls = [];
  const cityPay = {
    paymentIntents: {
      async create(input, options) { calls.push(['create', input, options]); return { paymentIntentId: 'pi_test' }; },
      async authorise(input) { calls.push(['authorise', input]); return { authorised: true }; },
      async verifyAuthorised(input) { calls.push(['verify', input]); return { status: 'success' }; }
    }
  };
  return { calls, cityPay, handlers: createHandlers(cityPay, '12345') };
}

test('the four routes keep their request and success response contracts', async () => {
  const { calls, handlers } = setup();
  const routes = [
    ['GET', 'ping', {}, 'pong'],
    ['GET', 'paymentSession', {}, { paymentIntentId: 'pi_test' }],
    ['POST', 'authorise', { intentId: 'pi_test' }, { authorised: true }],
    ['POST', 'verifyAuth', { intentId: 'pi_test' }, { status: 'success' }]
  ];

  for (const [method, name, body, expected] of routes) {
    const res = response();
    await createVercelHandler(method, name, () => handlers)({ method, body }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.headers['Cache-Control'], 'no-store');
    assert.deepEqual(res.body, expected);
  }

  assert.equal(calls[0][0], 'create');
  assert.equal(calls[0][1].merchantid, 12345);
  assert.equal(calls[0][1].amount, 1001);
  assert.match(calls[0][1].identifier, /^cart-/);
  assert.deepEqual(calls[1][1], { payment_intent_id: 'pi_test' });
  assert.deepEqual(calls[2][1], { unmask_fields: [], payment_intent_id: 'pi_test' });
});

test('authorisation routes reject a missing intent ID', async () => {
  const { handlers } = setup();
  for (const name of ['authorise', 'verifyAuth']) {
    const res = response();
    await createVercelHandler('POST', name, () => handlers)({ method: 'POST', body: {} }, res);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, 'Missing intentId');
    assert.equal(res.headers['Cache-Control'], 'no-store');
  }
});

test('unsupported methods return JSON and do not invoke the handler', async () => {
  const res = response();
  await createVercelHandler('POST', 'authorise', () => { throw Error('called'); })({ method: 'GET' }, res);
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.Allow, 'POST');
  assert.equal(res.headers['Cache-Control'], 'no-store');
  assert.deepEqual(res.body, { error: 'Method not allowed' });
});

test('SDK failures do not expose the exception to the response or logs', async (t) => {
  const { cityPay } = setup();
  cityPay.paymentIntents.create = async () => { throw Error('secret credential'); };
  const logged = [];
  t.mock.method(console, 'error', (...args) => logged.push(args.join(' ')));
  const res = response();
  await createVercelHandler('GET', 'paymentSession', () => createHandlers(cityPay, '12345'))({ method: 'GET' }, res);
  assert.equal(res.statusCode, 500);
  assert.equal(res.headers['Cache-Control'], 'no-store');
  assert.equal(res.body.error, 'Failed to create payment session');
  assert.doesNotMatch(JSON.stringify(res.body) + logged.join(' '), /secret credential/);
});

test('missing server configuration returns JSON without revealing values', async (t) => {
  t.mock.method(console, 'error', () => {});
  const res = response();
  await createVercelHandler('GET', 'paymentSession', () => { throw Error('secret credential'); })({ method: 'GET' }, res);
  assert.equal(res.statusCode, 503);
  assert.deepEqual(res.body, { error: 'Sandbox unavailable' });
  assert.equal(res.headers['Cache-Control'], 'no-store');
});
