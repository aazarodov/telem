'use strict';

const log = require('logger-file-fun-line');
const supportChats = require('../../../db/queries/supportChats');

module.exports = {
  get: async (ctx) => {
    try {
      const list = await supportChats.messagesList(
        ctx.state.data.chatId,
        ctx.state.data.limit,
        ctx.state.data.bookmark,
      );
      if (list === null) {
        ctx.status = 404;
        ctx.body = {
          status: 'error',
          message: 'supportChat not found',
        };
        return;
      }
      ctx.body = {
        status: 'success',
        message: 'supportMessages list',
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
