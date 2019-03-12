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
  put: async (ctx) => {
    const chatRaw = {
      _id: '',
      type: 'supportChat',
      pid: ctx.state.access.pid,
      did: '',
      title: ctx.state.data.title,
      meta: ctx.state.data.meta,
      openDate: new Date(),
      closeDate: '',
    };

    const messageRaw = {
      _id: '',
      type: 'supportMessage',
      chatId: '',
      from: ctx.state.access.pid,
      to: '',
      sendDate: ctx.state.data.firstMessage.sendDate,
      receivedDate: new Date(),
      deliveredDate: '',
      readDate: '',
      meta: ctx.state.data.firstMessage.meta,
      text: ctx.state.data.firstMessage.text,
    };

    try {
      const res = await supportChats.create(chatRaw, messageRaw);
      ctx.status = 201;
      ctx.body = {
        status: 'success',
        message: 'supportChat created',
        data: {
          _id: res.createdChat.id,
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
};
