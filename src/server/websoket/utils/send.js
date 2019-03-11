'use strict';

const log = require('logger-file-fun-line');
const getId = require('uuid/v4');

const callbacks = {};

module.exports = {
  req(ws, method, params, cb) {
    const msg = {
      jsonrpc: '2.0',
      method,
      params,
    };
    if (typeof cb === 'function') {
      const callbackId = getId();
      callbacks[callbackId] = cb;
      msg.id = callbackId;
    }
    ws.send(JSON.stringify(msg));
  },
  res(ws, error, result, id) {
    const msg = {
      jsonrpc: '2.0',
      error,
      result,
      id,
    };
    ws.send(JSON.stringify(msg));
  },
  async cb(id, error, result) { // clients, userId, wsId
    if (typeof callbacks[id] === 'function') {
      await callbacks[id](error, result);
      delete callbacks[id];
    }
    log('id of result or error not found', id);
  },
};
