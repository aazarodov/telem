/* eslint-disable no-param-reassign */

'use strict';

const log = require('logger-file-fun-line');
const doctors = require('../../db/queries/doctors');
const { supportTitles } = require('../../db/queries/supportChats');

module.exports = async (clients, userId, wsId, data) => {
  if (clients[userId].accessType !== 'patient' && clients[userId].group !== 'operator') {
    return ['supportChats for patient and operator only', null];
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
  return [null, 'success'];
};
