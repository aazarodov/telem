'use strict';

const log = require('logger-file-fun-line');
const { updateAvatar } = require('../../../db/queries/patients');

module.exports = {
  post: async (ctx) => {
    try {
      const response = await updateAvatar(
        ctx.state.access.pid,
        ctx.state.data.fileId,
      );
      if (response.ok) {
        ctx.body = {
          status: 'success',
          message: 'avatar updated',
        };
      } else {
        ctx.status = 500;
        ctx.body = {
          status: 'error',
          message: 'couchdb updateAvatar error',
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
  delete: async (ctx) => {
    try {
      const response = await updateAvatar(
        ctx.state.access.pid,
        '',
      );
      if (response.ok) {
        ctx.body = {
          status: 'success',
          message: 'avatar deleted',
        };
      } else {
        ctx.status = 500;
        ctx.body = {
          status: 'error',
          message: 'couchdb updateAvatar error',
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
