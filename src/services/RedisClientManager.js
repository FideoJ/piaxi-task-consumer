const redis = require('redis');
const { redis: redisConfig } = require('../config');
const { logger, assign } = require('../utils');
const Promise = require('bluebird');

Promise.promisifyAll(redis.RedisClient.prototype);

class RedisClientManager {
  constructor() {
    this.connections = [];
  }

  getClient(id, config = {}) {
    const self = this;
    if (self.connections[id]) {
      return self.connections[id];
    }
    const client = RedisClientManager.createClient(config);
    self.connections[id] = client;
    return client;
  }

  static createClient(config = {}) {
    config = assign(RedisClientManager.getDefaultConfig(), config);
    const client = redis.createClient(config);
    client.on('error', (e) => {
      logger.error('[redis climgr] Redis 查询出错', e.stack);
    });
    return client;
  }

  static getDefaultConfig() {
    return redisConfig;
  }
}

exports = module.exports = RedisClientManager;
