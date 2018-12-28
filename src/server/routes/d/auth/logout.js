'use strict';

const log = require('logger-file-fun-line');

const logout = (ctx) => {
  ctx.cookies.set('dat');
  ctx.status = 200;
  ctx.body = {
    status: 'success',
    message: 'logout successful',
  };
};

module.exports = {
  get: logout,
  post: logout,
};
