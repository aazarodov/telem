'use strict';

const log = require('logger-file-fun-line');

module.exports = () => async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    log(error);
    if (error.message.search(/JSON/) !== -1) {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: 'JSON format error',
        error: {
          message: error.message,
          body: error.body,
        },
      };
      return;
    }
    ctx.status = 500;
    ctx.body = {
      status: 'error',
      message: 'Internal Server Error',
      error: error.message,
    };
  }
};
