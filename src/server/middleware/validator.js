'use strict';

const log = require('logger-file-fun-line');
const { deepReaddirSync } = require('../utils/deepReaddir');

module.exports = (dir) => {
  const methods = {
    bodyDeny: ['get', 'head', 'options'],
    bodyAllow: ['post', 'put', 'patch', 'delete'],
  };
  const schemas = {};
  const list = deepReaddirSync(dir);
  list.forEach((file) => {
    const route = process.platform === 'win32'
      ? file.slice(dir.length, -3).replace(/\\/g, '/')
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
        let data = {};
        if (methods.bodyAllow.indexOf(method) !== -1 && Object.keys(ctx.request.body).length) {
          data = ctx.request.body;
        } else {
          data = ctx.request.query;
        }
        ctx.state.data = await schemas[ctx.path][method].validate(data);
        ctx.state.validate = true;
      } catch (error) {
        ctx.status = 400;
        ctx.body = {
          status: 'error',
          message: 'validate error',
          error: { message: error.message },
        };
        return;
      }
    }
    await next();
  };
};
