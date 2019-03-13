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
  patient01Id,
  doctor05Id,
} = require('./things/values');

const { expect } = chai;
const callbacks = {};
let wsP01;
let wsD05;

after(() => {
  if (typeof wsP01.close === 'function') wsP01.close();
  if (typeof wsD05.close === 'function') wsD05.close();
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

describe('WebSocket createSupportChat', () => {
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
        done();
      });
    });
  });
  describe('WebSocket createSupportChat as patient01', () => {
    it('patient01  -> createSupportChat,\n      ✓ doctor05 <- createSupportChat,\n      ✓ patient01  <- createSupportChatCallback', (done) => {
      const title = 'Запись на прием';
      const sendDate = new Date();
      const text = 'Чем общий анализ крови отличается от развёрнутого?';
      let newSupportChatId;
      sendReq(wsP01, 'createSupportChat', {
        title,
        firstMessage: {
          sendDate,
          text,
        },
      }, (error, result) => {
        if (error) {
          expect(true, error).to.be.false();
          done();
          return;
        }
        expect(result.supportChat).to.have.property('_id', newSupportChatId);
        expect(result.supportChat).to.have.property('type', 'supportChat');
        expect(result.supportChat).to.have.property('pid', patient01Id);
        expect(result.supportChat).to.have.property('did', '');
        expect(result.supportChat).to.have.property('title', title);
        expect(result.supportChat).to.have.property('meta');
        expect(result.supportChat).to.have.property('openDate');
        expect(result.supportChat).to.have.property('closeDate', '');
        expect(result.supportMessage).to.have.property('_id');
        expect(result.supportMessage).to.have.property('type', 'supportMessage');
        expect(result.supportMessage).to.have.property('chatId', newSupportChatId);
        expect(result.supportMessage).to.have.property('from', patient01Id);
        expect(result.supportMessage).to.have.property('to', '');
        expect(result.supportMessage).to.have.property('sendDate', sendDate.toJSON());
        expect(result.supportMessage).to.have.property('receivedDate');
        expect(result.supportMessage).to.have.property('deliveredDate', '');
        expect(result.supportMessage).to.have.property('readDate', '');
        expect(result.supportMessage).to.have.property('meta');
        expect(result.supportMessage).to.have.property('text', text);
        console.log('      ✓ patient01 <- createSupportChatCallback');
        done();
      });
      wsP01.once('message', handleMessage);
      wsD05.once('message', (msgStr) => {
        const msg = handleMessage(msgStr);
        expect(msg).to.have.property('method', 'supportChatCreated');
        expect(msg).to.have.property('params');
        expect(msg.params).to.have.property('_id');
        newSupportChatId = msg.params._id;
        expect(msg.params).to.have.property('type', 'supportChat');
        expect(msg.params).to.have.property('pid', patient01Id);
        expect(msg.params).to.have.property('did', '');
        expect(msg.params).to.have.property('title', title);
        expect(msg.params).to.have.property('meta');
        expect(msg.params).to.have.property('openDate');
        expect(msg.params).to.have.property('closeDate', '');
        console.log('      ✓ doctor05 <- supportChatCreated');
      });
      console.log('      ✓ patient01 -> createSupportChat');
    });
  });
});
