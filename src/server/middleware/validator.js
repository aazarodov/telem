'use strict';

const log = require('logger-file-fun-line');
const { deepReaddirSync } = require('../utils/deepReaddir');

module.exports = (dir) => {
  const schemas = {};
  const list = deepReaddirSync(dir);
  list.forEach((file) => {
    const validatorName = file.slice(dir.length, -3);
    // eslint-disable-next-line global-require, import/no-dynamic-require
    schemas[validatorName] = require(file);
  });
  return async (ctx, next) => {
    const method = ctx.method.toLowerCase();
    if (
      ctx.path === '/'
      || !schemas[ctx.path]
      || !schemas[ctx.path][method]
    ) {
      ctx.state.validate = false;
      await next();
    } else {
      try {
        await schemas[ctx.path][method].validate(ctx.request.body);
        ctx.state.validate = true;
        await next();
      } catch (error) {
        ctx.status = 400;
        ctx.body = {
          status: 'error',
          message: 'validate error',
          error: { message: error.message, body: ctx.request.body },
        };
      }
    }
  };
};