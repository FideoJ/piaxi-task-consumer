const Promise = require('bluebird');
const { ClientManager } = require('./services/redis');

const { redis: redisConfig } = require('./config');

class Fetcher {
  constructor() {
    const manager = new ClientManager();
    this.client = manager.getClient(1);
  }

  async retrieveTasks(type) {
    const keys = await this.client.keysAsync(`${type}*`);
    const tasks = [];
    let task;
    for (const key of keys) {
      task = await this.client.getAsync(key);
      task = JSON.parse(task);
      tasks.push(task);
    }
    return tasks;
  }

  async retrieveDubTasks() {
    return this.retrieveTasks('dub');
  }

  async retrieveFaceTasks() {
    return this.retrieveTasks('face');
  }
}

exports = module.exports = Fetcher;