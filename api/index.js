const app = require('../packages/demo-server/src/app');

module.exports = (req, res) => {
  const route = Array.isArray(req.query.route) ? req.query.route[0] : req.query.route;
  req.url = `/${route || ''}`;
  return app(req, res);
};
