const moment = require('moment');

const logger = {
  log: (...args) => {
    console.log(moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS '), ...args);
  }
};
const { assign } = Object;

exports = module.exports = { logger, assign };