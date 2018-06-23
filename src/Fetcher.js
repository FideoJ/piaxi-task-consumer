const { redis: { namespaces } } = require('./config');

class Fetcher {
  constructor(redisClient) {
    this.client = redisClient;
  }

  async retrieveTasks(type) {
    const keys = await this.client.keysAsync(`${namespaces.tasks}:${type}-*`);
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
