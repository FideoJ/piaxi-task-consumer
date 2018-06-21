const Fetcher = require('./fetcher');
const Executer = require('./executer');

class Driver {
  constructor() {
    this.fetcher = new Fetcher();
    this.executer = new Executer();
  }

  async tick() {
    const dubTasks = await this.fetcher.retrieveDubTasks();
    for (const task of dubTasks) {
      const [ original, user_face, actor ] = task.input;
      this.executer.execFakeTask(original, user_face, actor);
    }
      
  }

  loop() {
    setInterval(() => {
      this.tick();
    }, 1 * 1000);
  }
}

exports = module.exports = Driver;