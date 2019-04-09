'use strict';

const log = require('logger-file-fun-line');
const send = require('../utils/send');
const supportChats = require('../../db/queries/supportChats');

module.exports = async (clients, userId, wsId, data) => {
  if (clients[userId].accessType !== 'patient' && clients[userId].group !== 'operator') {
    return ['supportChats for patient and operator only', null];
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
  if (clients[result.pid] && Object.keys(clients[result.pid].ws).length > 0) {
    Object.values(clients[result.pid].ws).forEach((ws) => {
      send.req(ws, 'supportChatClosed', {
        _id: data._id,
        title: result.title,
        closeDate: result.closeDate,
        meta: result.meta,
      });
    });
  }
  if (result.did) { // chat taken -> notify operator by did
    if (clients[result.did] && Object.keys(clients[result.did].ws).length > 0) {
      Object.values(clients[result.did].ws).forEach((ws) => {
        send.req(ws, 'supportChatClosed', {
          _id: data._id,
          title: result.title,
          closeDate: result.closeDate,
          meta: result.meta,
        });
      });
    }
  } else { // chat not taken -> notify all operator with this title
    Object.keys(clients).forEach((clientIndex) => {
      if (
        (clients[clientIndex].group === 'operator'
          && clients[clientIndex].userDoc.meta
          && clients[clientIndex].userDoc.meta.supportTitles
          && clients[clientIndex].userDoc.meta.supportTitles.includes(result.title))
          && Object.keys(clients[clientIndex].ws).length > 0) {
        Object.values(clients[clientIndex].ws).forEach((ws) => {
          send.req(ws, 'supportChatClosed', {
            _id: data._id,
            title: result.title,
            closeDate: result.closeDate,
            meta: result.meta,
          });
        });
      }
    });
  }
  return [null, 'success'];
};
