'use strict';

const log = require('logger-file-fun-line');
const statusesOfAnalysisFetch = require('../db/queries/statusesOfAnalysisFetch');

module.exports = {
  get: async (ctx) => {
    try {
      const response = await statusesOfAnalysisFetch(
        ctx.state.access.pid,
        ctx.state.data._id,
      );
      ctx.body = {
        status: 'success',
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
