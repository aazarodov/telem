'use strict';

const log = require('logger-file-fun-line');
const send = require('../utils/send');
const supportChats = require('../../db/queries/supportChats');

module.exports = async function messageDelivered(clients, userId, wsId, data) {
  let result;
  try {
    result = await supportChats.updMessageStatus(userId, data);
  } catch (err) {
    return [err.message, null];
  }
  if (!result.ok) {
    return [result.reason, null];
  }
  if (clients[result.from] && Object.keys(clients[result.from].ws).length > 0) {
    Object.values(clients[result.from].ws).forEach((ws) => {
      send.req(ws, 'messageDelivered', { ...data, chatId: result.chatId });
    });
  }
  return [null, 'success'];
};
