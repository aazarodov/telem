'use strict';

const log = require('logger-file-fun-line');
const send = require('../utils/send');
const supportChats = require('../../db/queries/supportChats');

module.exports = async (clients, userId, wsId, data) => {
  if (clients[userId].group === 'doctor') {
    return ['supportChats for operator only', null];
  }
  let result;
  try {
    result = await supportChats.closeSupportChat(userId, data._id);
  } catch (err) {
    return [err.message, null];
  }
  if (!result.ok) {
    return [result.reason, null];
  }
  if (clients[result.pid] && clients[result.pid].ws.length > 0) {
    clients[result.pid].ws.forEach((ws) => {
      send.req(ws, 'supportChatClosed', {
        _id: data._id,
        closeDate: result.closeDate,
        meta: result.meta,
      });
    });
  }
  if (clients[result.did] && clients[result.did].ws.length > 0) {
    clients[result.did].ws.forEach((ws) => {
      send.req(ws, 'supportChatClosed', {
        _id: data._id,
        closeDate: result.closeDate,
        meta: result.meta,
      });
    });
  }
  return [null, 'success'];
};
