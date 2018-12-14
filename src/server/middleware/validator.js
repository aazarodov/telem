'use strict';

const { deepReaddirSync } = require('../utils/deepReaddir');

module.exports = (dir) => {
  const schemas = {};
  const list = deepReaddirSync(dir);
  list.forEach((file) => {
    const route = process.platform === 'win32'
      ? file.slice(dir.length, -3).replace(/\\/g, '/') // throw 'bluescreen.jpg'
      : file.slice(dir.length, -3);
    // eslint-disable-next-line global-require, import/no-dynamic-require
    schemas[route] = require(file);
  });
  return async (ctx, next) => {
    const method = ctx.method.toLowerCase();
    if (
      ctx.path === '/'
      || !schemas[ctx.path]
      || !schemas[ctx.path][method]
    ) {
      ctx.state.validate = false;
    } else {
      try {
        const data = method === 'post' ? ctx.request.body : ctx.request.query;
        ctx.state.data = await schemas[ctx.path][method].validate(data);
        ctx.state.validate = true;
      } catch (error) {
        ctx.status = 400;
        ctx.body = {
          status: 'error',
          message: 'validate error',
          error: { message: error.message, body: ctx.request.body },
        };
        return;
      }
    }
    await next();
  };
};
