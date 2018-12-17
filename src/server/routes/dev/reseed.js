'use strict';

const log = require('logger-file-fun-line');
const ramSeeding = require('../../db/seeds/hw_0_ram');
const smsSeeding = require('../../db/seeds/sms');
const filesSeeding = require('../../db/seeds/files');

const reseed = async (ctx) => {
  if (process.env.NODE_ENV === 'dev1' || process.env.NODE_ENV === 'dev2') {
    try {
      await ramSeeding();
      await smsSeeding();
      await filesSeeding();
    } catch (error) {
      log(error);
      ctx.status = 500;
      ctx.body = {
        status: 'error',
        message: `reseed ${process.env.NODE_ENV} error`,
        error,
      };
      return;
    }
    ctx.status = 200;
    ctx.body = {
      status: 'success',
      message: `reseed ${process.env.NODE_ENV} successful`,
    };
  } else {
    ctx.status = 400;
    ctx.body = {
      status: 'error',
      message: `can't reseed ${process.env.NODE_ENV}`,
    };
  }
};

module.exports = {
  get: reseed,
  post: reseed,
};
