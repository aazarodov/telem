'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const log = require('logger-file-fun-line');
const server = require('../src/server/app');
const ramSeeding = require('../src/server/db/seeds/hw_0_ram');
const smsSeeding = require('../src/server/db/seeds/sms');
const filesSeeding = require('../src/server/db/seeds/files');

chai.use(chaiHttp);
let localServer;

before(async () => {
  // TODO take localServer to separate file, add support default host
  localServer = chai.request(server).keepOpen();
  await ramSeeding();
  await smsSeeding();
  await filesSeeding();
});

after(() => { localServer.close(); });