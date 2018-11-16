'use strict';

const log = require('logger-file-fun-line');
const logoutSchema = require('../../schemas/routes/logout');

module.exports = {
  '/': {
    post: async (ctx) => {
      try {
        await logoutSchema.validate(ctx.request.body);
      } catch (error) {
        ctx.status = 400;
        ctx.body = {
          status: 'error',
          message: 'validate error',
          error: { message: error.message, body: ctx.request.body },
        };
        return;
      } // TODO del accessToken from storage
      ctx.status = 200;
      ctx.body = {
        status: 'success',
        message: 'logout successful',
      };
    },
  },
};
