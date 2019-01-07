'use strict';

const log = require('logger-file-fun-line');
const laboratoryAnalyzes = require('../../db/queries/laboratoryAnalyzes');

module.exports = {
  get: async (ctx) => {
    try {
      if (ctx.state.data._id) {
        const doc = await laboratoryAnalyzes.getById(
          ctx.state.access.pid,
          ctx.state.data._id,
        );
        if (doc) {
          ctx.body = {
            status: 'success',
            message: 'laboratoryAnalysis doc',
            data: doc,
          };
        } else {
          ctx.status = 404;
          ctx.body = {
            status: 'error',
            message: 'laboratoryAnalysis not found',
          };
        }
        return;
      }
      const list = await laboratoryAnalyzes.list(
        ctx.state.access.pid,
        ctx.state.data.limit,
        ctx.state.data.bookmark,
      );
      ctx.body = {
        status: 'success',
        message: 'laboratoryAnalyzes list',
        data: list,
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
