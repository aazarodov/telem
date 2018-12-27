'use strict';

const log = require('logger-file-fun-line');
const laboratoryAnalyzes = require('../../db/queries/laboratoryAnalyzes');

module.exports = {
  get: async (ctx) => {
    try {
      const response = await laboratoryAnalyzes(
        ctx.state.access.pid,
        ctx.state.data.limit,
        ctx.state.data.bookmark,
      );
      ctx.body = {
        status: 'success',
        message: 'laboratoryAnalyzes list',
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
