'use strict';

const log = require('logger-file-fun-line');
const { accessBy } = require('../../../db/queries/family');

module.exports = {
  get: async (ctx) => {
    try {
      const response = await accessBy(ctx.state.access.pid);
      ctx.body = {
        status: 'success',
        message: 'accessBy list',
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
