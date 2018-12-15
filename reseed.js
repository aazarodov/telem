'use strict';

process.env.NODE_ENV = 'development';

const log = require('logger-file-fun-line');
const ramSeeding = require('./src/server/db/seeds/hw_0_ram');
const smsSeeding = require('./src/server/db/seeds/sms');
const filesSeeding = require('./src/server/db/seeds/files');

(async () => {
  try {
    await ramSeeding();
    await smsSeeding();
    await filesSeeding();
  } catch (error) {
    log(error);
  }
})();
