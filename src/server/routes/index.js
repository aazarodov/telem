'use strict';

module.exports = {
  '/': async (ctx) => {
    ctx.body = {
      status: 'success',
      message: 'index',
    };
  },
};
