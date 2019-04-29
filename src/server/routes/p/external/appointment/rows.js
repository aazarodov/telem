'use strict';

const log = require('logger-file-fun-line');
const filters = require('../../../../db/queries/filters');

module.exports = {
  get: async (ctx) => {
    try {
      const response = await filters(
        ctx.state.data.cityName,
        ctx.state.data.sex,
        ctx.state.data.age,
      );
      ctx.body = {
        status: 'success',
        message: 'rows for appointment',
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
