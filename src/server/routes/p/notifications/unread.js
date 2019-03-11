'use strict';

const log = require('logger-file-fun-line');
const { unread } = require('../../../db/queries/supportChats');

module.exports = {
  get: async (ctx) => {
    try {
      ctx.body = {
        status: 'success',
        message: 'unread messages list',
        data: await unread(
          ctx.state.access.pid,
          ctx.state.data.limit,
          ctx.state.data.bookmark,
        ),
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
