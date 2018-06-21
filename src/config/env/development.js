const path = require('path');

module.exports = {
  root: path.join(__dirname, '..', '..'),
  url: 'http://localhost:8998',
  port: 8998,
  redis: {
    host: 'localhost',
    port: '6379',
    db: 3,
    // namespaces: {
    //   session: 'piaxi-se:session',
    // },
  },
};
