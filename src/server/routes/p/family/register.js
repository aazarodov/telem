'use strict';

const log = require('logger-file-fun-line');
const { insertNew } = require('../../../db/queries/family');

module.exports = {
  post: async (ctx) => {
    try {
      const res = await insertNew(ctx.state.access.pid, ctx.state.data);
      ctx.status = 201;
      ctx.body = {
        status: 'success',
        message: 'new bound patient created',
        data: { _id: res.id },
      };
      return;
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
