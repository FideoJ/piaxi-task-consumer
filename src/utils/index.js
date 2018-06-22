const moment = require('moment');
const { redis: { namespace } } = require('../config');

const logger = {
  log: (...args) => {
    console.log(moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS '), ...args);
  },
};
const { assign } = Object;

const findTask = task => `${namespace.tasks}:${task.type}-${task.works_id}`;
const findLock = task => `${namespace.lock}:${task.type}-${task.works_id}`;

exports = module.exports = { logger, assign, findTask, findLock };
