/* eslint-disable no-param-reassign */

'use strict';

const log = require('logger-file-fun-line');
const send = require('../utils/send');
const supportChats = require('../../db/queries/supportChats');

module.exports = async (clients, userId, wsId, data) => {
  if (clients[userId].group !== 'operator') {
    return ['only operator can take supportChat', null];
  }
  let res;
  try {
    res = await supportChats.take(userId, data._id);
    if (!res.ok) {
      return [res.reason, null];
    }
  } catch (error) {
    log(error);
    return ['couchdb error', null];
  }
  if (clients[res.pid] && clients[res.pid].ws.length > 0) {
    clients[res.pid].ws.forEach((ws) => {
      send.req(ws, 'supportChatTaken', { _id: data._id });
    });
  }
  Object.keys(clients).forEach((clientIndex) => {
    if (clientIndex !== userId
      && (clients[clientIndex].group === 'operator'
        && clients[clientIndex].userDoc.meta
        && clients[clientIndex].userDoc.meta.supportTitles
        && clients[clientIndex].userDoc.meta.supportTitles.includes(res.title))
      && clients[clientIndex].ws.length > 0) {
      clients[clientIndex].ws.forEach((ws) => {
        send.req(ws, 'supportChatTaken', { _id: data._id });
      });
    }
  });
  return [null, 'success'];
};
