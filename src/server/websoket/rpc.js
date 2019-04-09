'use strict';

const log = require('logger-file-fun-line');
const { join } = require('path');
const dynamicRequire = require('../utils/dynamicRequire');
const send = require('./utils/send');
const id = require('../utils/_id')();

const schemas = dynamicRequire(join(__dirname, 'schemas'));
const methods = dynamicRequire(join(__dirname, 'methods'));

const clients = {};

module.exports = (ws, req) => {
  const userId = req.state.access.pid || req.state.access.did;
  const accessType = req.state.access.type;
  const doctorGroup = req.state.access.group || null;
  const { userDoc } = req.state;
  if (!clients[userId]) {
    clients[userId] = {
      accessType,
      group: doctorGroup,
      userDoc,
      ws: {},
    };
  }
  const wsId = id();
  clients[userId].ws[wsId] = ws;

  const handleMessage = async (msgStr) => {
    let msg;
    let data;
    try {
      msg = JSON.parse(msgStr);
    } catch (error) {
      send.res(ws, 'parse error', null, null);
    }
    if (msg.method) {
      if (methods[msg.method]) {
        if (schemas[msg.method]) {
          try {
            data = await schemas[msg.method].validate(msg.params);
          } catch (error) {
            log(error);
            send.res(ws, 'validate error', null, msg.id || null);
            return;
          }
        } else {
          send.res(ws, 'schema not found', null, msg.id || null);
          return;
        }
        if (msg.id) {
          const [error, result] = await methods[msg.method](clients, userId, wsId, data);
          send.res(ws, error, result, msg.id);
        } else {
          await methods[msg.method](clients, userId, wsId, data);
        }
      } else {
        send.res(ws, 'procedure not found', null, msg.id || null);
      }
    } else if (typeof msg.result !== 'undefined' || typeof msg.error !== 'undefined') {
      if (msg.id) {
        send.cb(msg.id, msg.error, msg.result);
      } else {
        log('msg result/error without id:', msg);
      }
    } else {
      send.res(ws, 'incorrect json-rpc', null, null);
    }
  };
  ws.on('close', () => {
    delete clients[userId].ws[wsId];
    if (Object.keys(clients[userId].ws).length === 0) {
      delete clients[userId];
    }
  });
  ws.on('message', handleMessage);
  send.req(ws, 'connected', {
    userId,
    wsId,
    wsNumber: Object.keys(clients[userId].ws).length,
    accessType,
    doctorGroup,
    meta: userDoc.meta,
  });
};
