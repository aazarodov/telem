'use strict';

module.exports = {
  get: async (ctx) => {
    ctx.body = {
      status: 'success',
      message: 'index',
    };
  },
};
