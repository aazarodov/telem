'use strict';

const Router = require('koa-router');
const log = require('logger-file-fun-line');
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
      router[method](route.replace(/\/index$/, '/'), controller[method]);
    });
    app.use(router.routes());
  });
};
