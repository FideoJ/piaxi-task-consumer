const Driver = require('./Driver');

const driver = new Driver();
driver.init().then(() => {
  driver.loop();
});
