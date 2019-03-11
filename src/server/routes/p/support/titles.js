'use strict';

const log = require('logger-file-fun-line');
const { supportTitles } = require('../../../db/queries/supportChats');

module.exports = {
  get: async (ctx) => {
    try {
      ctx.body = {
        status: 'success',
        message: 'supportTitles list',
        data: await supportTitles(),
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
