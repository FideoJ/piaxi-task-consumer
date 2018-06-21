const Fetcher = require('./fetcher');
const Executer = require('./executer');
const { ClientManager } = require('./services/redis');
const { redis: redisConfig, workspace } = require('./config');
const { logger } = require('./utils');

class Driver {
  constructor() {
    const manager = new ClientManager();
    const redisClient = manager.getClient(1);
    this.fetcher = new Fetcher(redisClient);
    this.executer = new Executer(workspace);
    this.client = redisClient;
  }

  async init() {
    await this.client.setAsync('face-1', "{\"input\":[\"12\", \"23\", \"34\"],\"state\":\"ready\",\"works_id\":1,\"type\":\"face\"}");
    await this.client.setAsync('dub-1', "{\"input\":[\"12\", \"23\", \"34\"],\"state\":\"ready\",\"works_id\":1,\"type\":\"dub\"}");
    await this.client.setAsync('face-2', "{\"input\":[\"12\", \"23\", \"34\"],\"state\":\"running\",\"works_id\":2,\"type\":\"face\"}");
    await this.client.setAsync('dub-2', "{\"input\":[\"12\", \"23\", \"34\"],\"state\":\"ready\",\"works_id\":2,\"type\":\"dub\"}");
    await this.client.setAsync('face-3', "{\"input\":[\"12\", \"23\", \"34\"],\"state\":\"finished\",\"works_id\":3,\"type\":\"face\"}");
    await this.client.setAsync('dub-3', "{\"input\":[\"12\", \"23\", \"34\"],\"state\":\"ready\",\"works_id\":3,\"type\":\"dub\"}");
    await this.client.setAsync('dub-4', "{\"input\":[\"12\", \"23\", \"34\"],\"state\":\"ready\",\"works_id\":4,\"type\":\"dub\"}");
  }

  async tick() {
    const faceTasks = await this.fetcher.retrieveFaceTasks();
    const dubTasks = await this.fetcher.retrieveDubTasks();

    for (const faceTask of faceTasks) {
      if (faceTask.state != 'ready')
        continue;

      logger.log('[face] start ', JSON.stringify(faceTask));
      const [ original, user_face, actor ] = faceTask.input;
      await this.setTaskState('running', faceTask);
      await this.executer.execFakeTask(original, user_face, actor);
      logger.log('[face] finished ', JSON.stringify(faceTask));
      await this.setTaskState('finished', faceTask);
    }
    
    for (const dubTask of dubTasks) {
      const canRun = !faceTasks.find((faceTask) => {
        if (faceTask.works_id == dubTask.works_id && faceTask.state != 'finished')
          return true;
        return false;
      });

      if (!canRun || dubTask.state != 'ready')
        continue;

      logger.log('[dub] start ', JSON.stringify(dubTask));
      const [ original, user_face, actor ] = dubTask.input;
      await this.setTaskState('running', dubTask);
      await this.executer.execFakeTask(original, user_face, actor);
      logger.log('[dub] finished ', JSON.stringify(dubTask));
      await this.setTaskState('finished', dubTask);
    }
  }

  async setTaskState(state, task) {
    task.state = state;
    this.client.setAsync(`${task.type}-${task.works_id}`, JSON.stringify(task));
  }
  
  loop() {
    setInterval(() => {
      this.tick();
    }, 1 * 1000);
  }
}

exports = module.exports = Driver;