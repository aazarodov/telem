'use strict';

const log = require('logger-file-fun-line');
const files = require('../../db/queries/files');
const { fileMaxLength, fileMaxCount } = require('../../../../secrets');

const has = Object.prototype.hasOwnProperty;

module.exports = {
  put: async (ctx) => {
    if (!ctx.request.length) {
      ctx.status = 411;
      ctx.body = {
        status: 'error',
        message: 'Content-Length required',
      };
      return;
    }
    if (ctx.request.length > fileMaxLength) {
      ctx.status = 413;
      ctx.body = {
        status: 'error',
        message: 'Content-Length too large',
        error: { fileMaxLength },
      };
      return;
    }
    if (!ctx.request.type) {
      ctx.status = 415;
      ctx.body = {
        status: 'error',
        message: 'Content-Type required',
      };
      return;
    }
    if (ctx.request.type.search(/multipart/) !== -1) {
      ctx.status = 415;
      ctx.body = {
        status: 'error',
        message: 'multipart unsupported',
      };
      return;
    }
    if (await files.count(ctx.state.access.pid) >= fileMaxCount) {
      ctx.status = 423;
      ctx.body = {
        status: 'error',
        message: 'files limit reached',
        error: { fileMaxCount },
      };
      return;
    }
    const newFileDoc = {
      ...ctx.state.data,
      owner: ctx.state.access.pid,
      date: new Date(),
      type: ctx.request.type,
      length: ctx.request.length,
    };
    try {
      const res = await files.create(newFileDoc, ctx.req);
      ctx.status = 201;
      ctx.body = {
        status: 'success',
        message: 'file uploaded',
        data: {
          _id: res.id,
        },
      };
    } catch (error) {
      log(error);
      ctx.status = 500;
      ctx.body = {
        status: 'error',
        message: 'couchdb error',
      };
    }
  },
  get: async (ctx) => {
    try {
      if (ctx.state.data && ctx.state.data._id) {
        const ostream = await files.getAsStream(ctx.state.data._id, ctx.state.access.pid);
        if (ostream) {
          ctx.body = ostream;
        } else {
          ctx.status = 404;
          ctx.body = {
            status: 'error',
            message: 'file not found',
          };
        }
      } else {
        const list = await files.list(
          ctx.state.access.pid,
          ctx.state.data.limit,
          ctx.state.data.bookmark,
        );
        ctx.body = {
          status: 'success',
          message: 'file list',
          data: list,
        };
      }
    } catch (error) {
      log(error);
      ctx.status = 500;
      ctx.body = {
        status: 'error',
        message: 'couchdb error',
      };
    }
  },
  post: async (ctx) => {
    const res = await files.update(ctx.state.data, ctx.state.access.pid);
    if (has.call(res, '_id')) {
      ctx.body = {
        status: 'success',
        message: 'file updated',
        data: res,
      };
    } else {
      ctx.status = 404;
      ctx.body = {
        status: 'error',
        message: 'file not found',
      };
    }
  },
  delete: async (ctx) => {
    const res = await files.delete(ctx.state.data._id, ctx.state.access.pid);
    if (has.call(res, 'ok')) {
      ctx.body = {
        status: 'success',
        message: 'file deleted',
      };
    } else {
      ctx.status = 404;
      ctx.body = {
        status: 'error',
        message: 'file not found',
      };
    }
  },
};
