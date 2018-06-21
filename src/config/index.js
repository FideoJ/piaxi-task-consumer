const { assign } = require('../utils');

function getConfig() {
  const { NODE_ENV = 'development' } = process.env;
  assign(process.env, { NODE_ENV });
  let config = null;
  switch (NODE_ENV) {
    case 'development':
      config = require('./env/development');
      break;
    case 'production':
      config = require('./env/production');
      break;
    default:
      config = require('./env/development');
  }
  return config;
}

const config = getConfig();

exports = module.exports = config;
