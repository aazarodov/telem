'use strict';

const log = require('logger-file-fun-line');
const supportChats = require('../../../db/queries/supportChats');

module.exports = {
  get: async (ctx) => {
    try {
      if (ctx.state.data._id) {
        const doc = await supportChats.getById(
          ctx.state.data._id,
          ctx.state.access.pid,
        );
        if (doc) {
          ctx.body = {
            status: 'success',
            message: 'supportChat doc',
            data: doc,
          };
        } else {
          ctx.status = 404;
          ctx.body = {
            status: 'error',
            message: 'supportChat not found',
          };
        }
        return;
      }
      const list = await supportChats.list(
        ctx.state.access.pid,
        ctx.state.data.closed,
        ctx.state.data.limit,
        ctx.state.data.bookmark,
      );
      ctx.body = {
        status: 'success',
        message: 'supportChats list',
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
