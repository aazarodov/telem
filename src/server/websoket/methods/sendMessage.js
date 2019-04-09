'use strict';

const log = require('logger-file-fun-line');
const send = require('../utils/send');
const supportChats = require('../../db/queries/supportChats');

module.exports = async function sendMessage(clients, userId, wsId, data) {
  let newMessage;
  let error;
  try {
    [error, newMessage] = await supportChats.addMessage({
      _id: '',
      type: data.type,
      chatId: data.chatId,
      from: userId,
      to: '',
      sendDate: data.sendDate,
      receivedDate: new Date(),
      deliveredDate: '',
      readDate: '',
      meta: data.meta,
      text: data.text,
    });
  } catch (err) {
    return [err.message, null];
  }
  if (error) {
    return [error, null];
  }
  if (clients[newMessage.to] && Object.keys(clients[newMessage.to].ws).length > 0) {
    Object.values(clients[newMessage.to].ws).forEach((ws) => {
      send.req(ws, 'sendMessage', newMessage);
    });
  }
  return [null, newMessage];
};
