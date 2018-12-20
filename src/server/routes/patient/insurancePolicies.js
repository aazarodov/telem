'use strict';

const log = require('logger-file-fun-line');
const insurancePolicies = require('../../db/queries/insurancePolicies');

module.exports = {
  get: async (ctx) => {
    try {
      const response = await insurancePolicies(
        ctx.state.access.pid,
        ctx.state.data.limit,
        ctx.state.data.bookmark,
      );
      ctx.body = {
        status: 'success',
        message: 'insurancePolicies list',
        data: response,
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
