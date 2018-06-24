const moment = require('moment');
const { redis: { namespaces } } = require('../config');
const { NODE_ENV } = process.env;

const logger = {
  log: (...args) => {
    if (NODE_ENV === 'development')
      console.log(moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS '), ...args);
    else
      console.log(...args);
  },
};
const { assign } = Object;

const findTask = task => `${namespaces.tasks}:${task.type}-${task.works_id}`;
const findLock = task => `${namespaces.lock}:${task.type}-${task.works_id}`;

exports = module.exports = { logger, assign, findTask, findLock };
