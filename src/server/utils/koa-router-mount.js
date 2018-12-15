'use strict';

const Router = require('koa-router');
const { deepReaddirSync } = require('../utils/deepReaddir');

module.exports = (app, dir, prefix = '') => {
  const list = deepReaddirSync(dir);
  list.forEach((file) => {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const controller = require(file);
    const route = process.platform === 'win32'
      ? file.slice(dir.length, -3).replace(/\\/g, '/')
      : file.slice(dir.length, -3);
    const router = new Router();
    if (prefix) router.prefix(prefix);
    Object.keys(controller).forEach((method) => {
      if (route === '/index') router[method]('/', controller[method]);
      else router[method](route, controller[method]);
    });
    app.use(router.routes());
  });
};
