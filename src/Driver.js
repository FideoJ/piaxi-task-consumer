const Fetcher = require('./Fetcher');
const Executer = require('./Executer');
const RedisClientManager = require('./services/RedisClientManager');
const { workspace } = require('./config');
const { logger, findTask, findLock } = require('./utils');

class Driver {
  constructor() {
    const manager = new RedisClientManager();
    const redisClient = manager.getClient(1);
    this.fetcher = new Fetcher(redisClient);
    this.executer = new Executer(workspace);
    this.client = redisClient;
  }

  async init() {
    await this.client.setAsync('piaxi-tasks:face-1', '{"input":["12", "23", "34"],"state":"ready","works_id":1,"type":"face"}');
    await this.client.setAsync('piaxi-tasks:dub-1', '{"input":["12", "23", "34"],"state":"ready","works_id":1,"type":"dub"}');
    await this.client.setAsync('piaxi-tasks:face-2', '{"input":["12", "23", "34"],"state":"running","works_id":2,"type":"face"}');
    await this.client.setAsync('piaxi-tasks:dub-2', '{"input":["12", "23", "34"],"state":"ready","works_id":2,"type":"dub"}');
    await this.client.setAsync('piaxi-tasks:face-3', '{"input":["12", "23", "34"],"state":"finished","works_id":3,"type":"face"}');
    await this.client.setAsync('piaxi-tasks:dub-3', '{"input":["12", "23", "34"],"state":"ready","works_id":3,"type":"dub"}');
    await this.client.setAsync('piaxi-tasks:dub-4', '{"input":["12", "23", "34"],"state":"ready","works_id":4,"type":"dub"}');

    const locks = await this.client.keysAsync('piaxi-task-lock*');
    for (const key of locks) {
      await this.client.setAsync(key, '0');
    }
  }

  async tick() {
    const faceTasks = await this.fetcher.retrieveFaceTasks();
    const dubTasks = await this.fetcher.retrieveDubTasks();

    for (const faceTask of faceTasks) {
      this.processTask(faceTask);
    }

    for (const dubTask of dubTasks) {
      const canRun = !faceTasks.find((faceTask) => {
        if (faceTask.works_id === dubTask.works_id && faceTask.state !== 'finished')
          return true;
        return false;
      });
      if (!canRun)
        continue;
      this.processTask(dubTask);
    }
  }

  async processTask(task) {
    if (task.state !== 'ready')
      return;
    const locked = await this.client.getsetAsync(findLock(task), '1');
    if (locked && locked === '1')
      return;

    await this.setTaskState(task, 'running');
    await this.executer.execFakeTask(task);
    await this.setTaskState(task, 'finished');
  }

  async setTaskState(task, state) {
    task.state = state;
    await this.client.setAsync(findTask(task), JSON.stringify(task));
    logger.log(`[${task.type}-${task.works_id}] ${task.state}`, JSON.stringify(task));
  }

  loop() {
    setInterval(() => {
      this.tick();
    }, 1 * 1000);
  }
}

exports = module.exports = Driver;
