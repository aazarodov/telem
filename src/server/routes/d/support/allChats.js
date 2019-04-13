'use strict';

const log = require('logger-file-fun-line');
const supportChats = require('../../../db/queries/supportChats');

module.exports = {
  get: async (ctx) => {
    // TODO test supervisor rights
    try {
      const selectedList = await supportChats.selectAllList(
        ctx.state.data.titles,
        ctx.state.data.closed,
        ctx.state.data.limit,
        ctx.state.data.bookmark,
      );
      ctx.body = {
        status: 'success',
        message: 'allSupportChats list',
        data: selectedList,
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
