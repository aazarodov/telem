'use strict';

const log = require('logger-file-fun-line');
const { services } = require('../../../db/queries/appointments');

module.exports = {
  get: async (ctx) => {
    try {
      const servicesList = await services(ctx.state.data.chaild);
      ctx.body = {
        status: 'success',
        message: 'services list',
        data: servicesList,
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
