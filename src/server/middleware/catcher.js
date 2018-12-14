'use strict';

const log = require('logger-file-fun-line');

module.exports = () => async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    log(error);
    ctx.status = 500;
    ctx.body = {
      status: 'error',
      message: 'Internal Server Error',
    };
  }
};
