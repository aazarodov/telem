'use strict';

const log = require('logger-file-fun-line');
const supportChats = require('../../../db/queries/supportChats');

module.exports = {
  get: async (ctx) => {
    try {
      if (ctx.state.data._id) {
        const doc = await supportChats.getById(
          ctx.state.data._id,
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
      const selectedList = await supportChats.selectList(
        ctx.state.access.did,
        ctx.state.data.titles,
        ctx.state.data.new,
        ctx.state.data.closed,
        ctx.state.data.limit,
        ctx.state.data.bookmark,
      );
      ctx.body = {
        status: 'success',
        message: 'supportChats list',
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
