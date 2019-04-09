/* eslint-disable no-param-reassign */

'use strict';

const log = require('logger-file-fun-line');
const send = require('../utils/send');
const { supportTitles } = require('../../db/queries/supportChats');
const supportChats = require('../../db/queries/supportChats');

module.exports = async (clients, userId, wsId, data) => {
  if (clients[userId].accessType !== 'patient') {
    return ['only patient can crate supportChat', null];
  }
  const supportTitlesList = await supportTitles();
  if (!supportTitlesList.includes(data.title)) {
    return ['wrong supportTitle', null];
  }
  const chatRaw = {
    _id: '',
    type: 'supportChat',
    pid: userId,
    did: '',
    title: data.title,
    meta: data.meta,
    openDate: new Date(),
    closeDate: '',
  };

  const messageRaw = {
    _id: '',
    type: 'supportMessage',
    chatId: '',
    from: userId,
    to: '',
    sendDate: data.firstMessage.sendDate,
    receivedDate: new Date(),
    deliveredDate: '',
    readDate: '',
    meta: data.firstMessage.meta,
    text: data.firstMessage.text,
  };

  try {
    const res = await supportChats.create(chatRaw, messageRaw);
    if (!res.ok) {
      return ['couchdb error', null];
    }
    Object.keys(clients).forEach((clientIndex) => {
      if (
        (clients[clientIndex].group === 'operator'
          && clients[clientIndex].userDoc.meta
          && clients[clientIndex].userDoc.meta.supportTitles
          && clients[clientIndex].userDoc.meta.supportTitles.includes(data.title))
          && Object.keys(clients[clientIndex].ws).length > 0) {
        Object.values(clients[clientIndex].ws).forEach((ws) => {
          send.req(ws, 'supportChatCreated', res.chatDoc);
        });
      }
    });
    return [null, { supportChat: res.chatDoc, supportMessage: res.messageDoc }];
  } catch (error) {
    log(error);
    return ['couchdb error', null];
  }
};
