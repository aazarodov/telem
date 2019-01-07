'use strict';

const log = require('logger-file-fun-line');
const cityNames = require('../../db/queries/cityNames');

module.exports = {
  get: async (ctx) => {
    try {
      const response = await cityNames();
      ctx.body = {
        status: 'success',
        message: 'cityNames list',
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
