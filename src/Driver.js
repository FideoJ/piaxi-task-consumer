const Fetcher = require('./Fetcher');
const Executer = require('./Executer');
const RedisClientManager = require('./services/RedisClientManager');
const { workspace, pollInterval } = require('./config');
const { logger, findTask, findLock } = require('./utils');

class Driver {
  constructor() {
    const manager = new RedisClientManager();
    const redisClient = manager.getClient(1);
    this.fetcher = new Fetcher(redisClient);
    this.executer = new Executer(workspace);
    this.client = redisClient;
  }

  async tick() {
    logger.log('开始新一轮轮询...');
    const [faceTasks, dubTasks] = await Promise.all([
      this.fetcher.retrieveFaceTasks(),
      this.fetcher.retrieveDubTasks(),
    ]);

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
    await this.executer.execTask(task);
    await this.setTaskState(task, 'finished');
  }

  async setTaskState(task, state) {
    task.state = state;
    await this.client.setAsync(findTask(task), JSON.stringify(task));
    logger.log(`[${task.type}-${task.works_id}] ${task.state}`, JSON.stringify(task));
  }

  loop() {
    logger.log('piaxi-task-consumer启动成功');
    setInterval(() => {
      this.tick();
    }, pollInterval);
  }
}

exports = module.exports = Driver;
