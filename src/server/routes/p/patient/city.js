'use strict';

const log = require('logger-file-fun-line');
const { updateCity } = require('../../../db/queries/patients');

module.exports = {
  post: async (ctx) => {
    try {
      const response = await updateCity(
        ctx.state.access.pid,
        ctx.state.data.cityName,
      );
      if (response.ok) {
        ctx.body = {
          status: 'success',
          message: 'city updated',
        };
      } else if (response.error === 'city not found') {
        ctx.status = 404;
        ctx.body = {
          status: 'error',
          message: 'city not found',
        };
      } else {
        ctx.status = 500;
        ctx.body = {
          status: 'error',
          message: 'couchdb updateCity error',
          error: response,
        };
      }
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
