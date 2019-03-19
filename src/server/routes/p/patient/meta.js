'use strict';

const log = require('logger-file-fun-line');
const { updateMeta } = require('../../../db/queries/patients');

module.exports = {
  post: async (ctx) => {
    try {
      const response = await updateMeta(
        ctx.state.access.pid,
        ctx.state.data.meta,
      );
      if (response.ok) {
        ctx.body = {
          status: 'success',
          message: 'meta updated',
        };
      } else {
        ctx.status = 500;
        ctx.body = {
          status: 'error',
          message: 'couchdb updateMeta error',
          error: response,
        };
      }
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
