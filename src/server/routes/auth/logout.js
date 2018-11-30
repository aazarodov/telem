'use strict';

const log = require('logger-file-fun-line');

module.exports = {
  post: async (ctx) => {
    ctx.status = 200;
    ctx.body = {
      status: 'success',
      message: 'logout successful',
    };
  },
};
