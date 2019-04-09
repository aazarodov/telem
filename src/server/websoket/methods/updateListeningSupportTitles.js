/* eslint-disable no-param-reassign */

'use strict';

const log = require('logger-file-fun-line');
const doctors = require('../../db/queries/doctors');
const { supportTitles } = require('../../db/queries/supportChats');
const send = require('../utils/send');

module.exports = async (clients, userId, wsId, data) => {
  if (clients[userId].group !== 'operator') {
    return ['only operator can listening for new supportChat', null];
  }
  const supportTitlesList = await supportTitles();
  if (!data.supportTitles.every(title => supportTitlesList.includes(title))) {
    return ['wrong supportTitle', null];
  }
  let result;
  try {
    result = await doctors.updateMeta(userId, data);
  } catch (err) {
    return [err.message, null];
  }
  if (!result.ok) {
    return [result.reason, null];
  }
  if (!clients[userId].userDoc.meta) {
    clients[userId].userDoc.meta = {};
  }
  if (!clients[userId].userDoc.meta.supportTitles) {
    clients[userId].userDoc.meta.supportTitles = {};
  }
  clients[userId].userDoc.meta.supportTitles = data.supportTitles;
  clients[userId].ws.forEach((ws) => {
    send.req(ws, 'listeningSupportTitlesUpdated', { supportTitles: data.supportTitles });
  });
  return [null, 'success'];
};
