'use strict';

const log = require('logger-file-fun-line');
const statusesOfAnalysis = require('../db/queries/statusesOfAnalysis');

module.exports = {
  get: async (ctx) => {
    try {
      const response = await statusesOfAnalysis(
        ctx.state.access.pid,
        ctx.state.data._id,
      );
      ctx.body = {
        status: 'success',
        message: 'statusesOfAnalysis list',
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
