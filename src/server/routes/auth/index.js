'use strict';

module.exports = {
  '/': async (ctx) => {
    ctx.body = {
      status: 'success',
      message: 'post auth/register, post auth/login, post auth/logout',
    };
  },
};
