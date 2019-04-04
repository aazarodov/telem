'use strict';

const log = require('logger-file-fun-line');
const { create2 } = require('../../../db/queries/appointments');

module.exports = {
  post: async (ctx) => {
    try {
      const response = await create2(ctx.state.data);
      if (!response.ok) {
        ctx.status = 400;
        ctx.body = {
          status: 'error',
          message: 'appointment record2 create error',
          error: response,
        };
      }
      ctx.body = {
        status: 'success',
        message: 'appointment record2 created',
      };
    } catch (error) {
      log(error);
      ctx.status = 500;
      ctx.body = {
        status: 'error',
        message: 'couchdb error',
        error: error.message,
      };
    }
  },
};
