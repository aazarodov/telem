/* eslint-disable no-console */

'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const WebSocket = require('ws');
const log = require('logger-file-fun-line');
const getId = require('uuid/v4');
const {
  server,
  patient01Cookie,
  doctor05Cookie,
  doctor06Cookie,
  p01SupportChat05Id,
  patient01Id,
  doctor05Id,
  doctor06Id,
} = require('./things/values');

const { expect } = chai;
const callbacks = {};
let wsP01;
let wsD05;
let wsD06;

after(() => {
  if (typeof wsP01.close === 'function') wsP01.close();
  if (typeof wsD05.close === 'function') wsD05.close();
  if (typeof wsD06.close === 'function') wsD06.close();
});

const wsOptions = {
  protocol: 'jsonrpc-telem',
  headers: {
    host: 'patient.telmed.ml',
    cookie: `pat=${patient01Cookie}`,
  },
};

const sendReq = (ws, method, params, cb) => {
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
};

const handleMessage = (msgStr) => {
  let msg;
  expect(() => { msg = JSON.parse(msgStr); }).to.not.throw();
  expect(msg).to.have.property('jsonrpc', '2.0');
  try {
    expect(msg).to.have.property('method');
  } catch (e) {
    expect(msg).to.have.property('result');
    expect(msg).to.have.property('error');
    if (msg.id && typeof callbacks[msg.id] === 'function') {
      callbacks[msg.id](msg.error, msg.result);
    } else {
      log(msg);
    }
  }
  return msg;
};

describe('WebSocket takeSupportChat', () => {
  describe('WebSocket connect', () => {
    it('should return connected when patient01', (done) => {
      wsP01 = new WebSocket(`ws://${server}`, wsOptions);
      wsP01.once('message', (msgStr) => {
        const msg = handleMessage(msgStr);
        expect(msg).to.have.property('method', 'connected');
        expect(msg).to.have.property('params');
        expect(msg.params).to.have.property('userId', patient01Id);
        expect(msg.params).to.have.property('wsId');
        expect(msg.params).to.have.property('accessType', 'patient');
        expect(msg.params).to.have.property('doctorGroup', null);
        expect(msg.params).to.have.property('meta');
        expect(msg.params.meta).to.have.property('test', 'testString');
        done();
      });
    });
    it('should return connected when doctor05', (done) => {
      wsOptions.headers.cookie = `dat=${doctor05Cookie}`;
      wsOptions.headers.host = 'doctor.telmed.ml';
      wsD05 = new WebSocket(`ws://${server}`, wsOptions);
      wsD05.once('message', (msgStr) => {
        const msg = handleMessage(msgStr);
        expect(msg).to.have.property('method', 'connected');
        expect(msg).to.have.property('params');
        expect(msg.params).to.have.property('userId', doctor05Id);
        expect(msg.params).to.have.property('wsId');
        expect(msg.params).to.have.property('accessType', 'doctor');
        expect(msg.params).to.have.property('doctorGroup', 'operator');
        expect(msg.params).to.have.property('meta');
        expect(msg.params.meta).to.have.property('supportTitles');
        expect(msg.params.meta.supportTitles).to.have.property(0, 'Запись на прием');
        expect(msg.params.meta.supportTitles).to.have.property(1, 'Медицинские услуги');
        done();
      });
    });
    it('should return connected when doctor06', (done) => {
      wsOptions.headers.cookie = `dat=${doctor06Cookie}`;
      wsOptions.headers.host = 'doctor.telmed.ml';
      wsD06 = new WebSocket(`ws://${server}`, wsOptions);
      wsD06.once('message', (msgStr) => {
        const msg = handleMessage(msgStr);
        expect(msg).to.have.property('method', 'connected');
        expect(msg).to.have.property('params');
        expect(msg.params).to.have.property('userId', doctor06Id);
        expect(msg.params).to.have.property('wsId');
        expect(msg.params).to.have.property('accessType', 'doctor');
        expect(msg.params).to.have.property('doctorGroup', 'operator');
        expect(msg.params).to.have.property('meta');
        expect(msg.params.meta).to.have.property('supportTitles');
        expect(msg.params.meta.supportTitles).to.have.property(0, 'Запись на прием');
        done();
      });
    });
  });
  describe('WebSocket takeSupportChat p01SupportChat05Id', () => {
    it('doctor05  -> takeSupportChat\n      ✓ patient01 <- supportChatTaken\n      ✓ doctor06 <- supportChatTaken\n      ✓ doctor05 <- takeSupportChatCallback', (done) => {
      sendReq(wsD05, 'takeSupportChat', {
        _id: p01SupportChat05Id,
      }, (error, result) => {
        if (error) {
          expect(true, error).to.be.false();
          done();
          return;
        }
        expect(result).to.be.eq('success');
        console.log('      ✓ doctor05 <- takeSupportChatCallback');
        done();
      });
      wsD05.once('message', handleMessage);
      wsP01.once('message', (msgStr) => {
        const msg = handleMessage(msgStr);
        expect(msg).to.have.property('method', 'supportChatTaken');
        expect(msg).to.have.property('params');
        expect(msg.params).to.have.property('_id', p01SupportChat05Id);
        console.log('      ✓ patient01 <- supportChatTaken');
      });
      wsD06.once('message', (msgStr) => {
        const msg = handleMessage(msgStr);
        expect(msg).to.have.property('method', 'supportChatTaken');
        expect(msg).to.have.property('params');
        expect(msg.params).to.have.property('_id', p01SupportChat05Id);
        console.log('      ✓ doctor06 <- supportChatTaken');
      });
      console.log('      ✓ doctor05 -> takeSupportChat');
    });
  });
});
