const Driver = require('./driver');

const driver = new Driver();
driver.init().then(() => {
  driver.loop();
});
