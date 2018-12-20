'use strict';

const log = require('logger-file-fun-line');
const { updateAgreements } = require('../../db/queries/patients');

module.exports = {
  post: async (ctx) => {
    try {
      const response = await updateAgreements(
        ctx.state.access.pid,
        ctx.state.data,
      );
      if (response.ok) {
        ctx.body = {
          status: 'success',
          message: 'agreements updated',
        };
      } else {
        ctx.status = 500;
        ctx.body = {
          status: 'error',
          message: 'couchdb updateAgreements error',
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
