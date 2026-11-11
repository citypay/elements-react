const { createVercelHandler } = require('../packages/demo-server/src/vercel');

module.exports = createVercelHandler('POST', 'verifyAuth');
