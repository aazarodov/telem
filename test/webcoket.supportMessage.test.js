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
  p01SupportChat02Id,
  doctor01Cookie,
  doctor05Cookie,
  patient01Id,
  doctor01Id,
  doctor05Id,
} = require('./things/values');

const { expect } = chai;
const callbacks = {};
let wsP01;
let wsD01;
let wsD05;
let newMessageId;

after(() => {
  if (typeof wsP01.close === 'function') wsP01.close();
  if (typeof wsD01.close === 'function') wsD01.close();
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

describe('WebSocket sendMessage', () => {
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
        done();
      });
    });
    it('should return throw error when doctor01 connected to patient subdomain', (done) => {
      wsOptions.headers.cookie = `dat=${doctor01Cookie}`;
      wsOptions.headers.host = 'patient.telmed.ml';
      wsD01 = new WebSocket(`ws://${server}`, wsOptions);
      wsD01.on('error', () => {
        wsD01.close();
        done();
      });
      wsD01.on('open', () => {
        wsD01.close();
        expect(true, 'doctor connected to patient subdomain successfuly').to.be.false();
        done();
      });
    });
    it('should return throw error when patient01 connected to doctor subdomain', (done) => {
      wsOptions.headers.cookie = `pat=${patient01Cookie}`;
      wsOptions.headers.host = 'doctor.telmed.ml';
      wsD01 = new WebSocket(`ws://${server}`, wsOptions);
      wsD01.on('error', () => {
        wsD01.close();
        done();
      });
      wsD01.on('open', () => {
        wsD01.close();
        expect(true, 'patient connected to doctor subdomain successfuly').to.be.false();
        done();
      });
    });
    it('should return connected when doctor01', (done) => {
      wsOptions.headers.cookie = `dat=${doctor01Cookie}`;
      wsOptions.headers.host = 'doctor.telmed.ml';
      wsD01 = new WebSocket(`ws://${server}`, wsOptions);
      wsD01.once('message', (msgStr) => {
        const msg = handleMessage(msgStr);
        expect(msg).to.have.property('method', 'connected');
        expect(msg).to.have.property('params');
        expect(msg.params).to.have.property('userId', doctor01Id);
        expect(msg.params).to.have.property('wsId');
        expect(msg.params).to.have.property('accessType', 'doctor');
        expect(msg.params).to.have.property('doctorGroup', 'doctor');
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
        done();
      });
    });
  });
  describe('WebSocket sendMessage', () => {
    it('patient01 -> sendMessage, doctor05  <- sendMessage, patient01 <- sendMessageCallback', (done) => {
      const sendDate = new Date();
      const text = 'Some new message here';

      wsD05.once('message', (msgStr) => {
        const msg = handleMessage(msgStr);
        expect(msg).to.have.property('method', 'sendMessage');
        expect(msg).to.have.property('params');
        expect(msg.params).to.have.property('type', 'supportMessage');
        expect(msg.params).to.have.property('chatId', p01SupportChat02Id);
        expect(msg.params).to.have.property('from', patient01Id);
        expect(msg.params).to.have.property('to', doctor05Id);
        expect(msg.params).to.have.property('sendDate', sendDate.toJSON());
        expect(msg.params).to.have.property('receivedDate');
        const receivedDate = new Date(msg.params.receivedDate);
        expect(receivedDate.getTime()).to.be.closeTo(sendDate.getTime(), 5000);
        expect(msg.params).to.have.property('deliveredDate', '');
        expect(msg.params).to.have.property('readDate', '');
        expect(msg.params).to.have.property('meta');
        expect(msg.params).to.have.property('text', text);
        console.log('      ✓ doctor05  <- sendMessage');
      });

      wsP01.once('message', handleMessage);

      sendReq(wsP01, 'sendMessage', {
        chatId: p01SupportChat02Id,
        type: 'supportMessage',
        sendDate,
        text,
      }, (error, result) => {
        if (error) {
          expect(true, error).to.be.false();
          done();
          return;
        }
        newMessageId = result._id;
        expect(result).to.have.property('_id');
        expect(result).to.have.property('type', 'supportMessage');
        expect(result).to.have.property('chatId', p01SupportChat02Id);
        expect(result).to.have.property('from', patient01Id);
        expect(result).to.have.property('to', doctor05Id);
        expect(result).to.have.property('sendDate', sendDate.toJSON());
        expect(result).to.have.property('receivedDate');
        const receivedDate = new Date(result.receivedDate);
        expect(receivedDate.getTime()).to.be.closeTo(sendDate.getTime(), 5000);
        expect(result).to.have.property('deliveredDate', '');
        expect(result).to.have.property('readDate', '');
        expect(result).to.have.property('meta');
        expect(result).to.have.property('text', text);
        console.log('      ✓ patient01 <- sendMessageCallback');
        done();
      });
      console.log('      ✓ patient01 -> sendMessage');
    });
  });
  describe('WebSocket messageDelivered', () => {
    it('doctor05  -> messageDelivered, patient01 <- messageDelivered, doctor05  <- messageDeliveredCallback', (done) => {
      const deliveredDate = new Date();
      sendReq(wsD05, 'messageDelivered', {
        _id: newMessageId,
        deliveredDate,
      }, (error, result) => {
        if (error) {
          expect(true, error).to.be.false();
          done();
          return;
        }
        expect(result).to.be.eq('success');
        console.log('      ✓ doctor05 <- messageDeliveredCallback');
        done();
      });
      wsD05.once('message', handleMessage);
      wsP01.once('message', (msgStr) => {
        const msg = handleMessage(msgStr);
        expect(msg).to.have.property('method', 'messageDelivered');
        expect(msg).to.have.property('params');
        expect(msg.params).to.have.property('_id', newMessageId);
        expect(msg.params).to.have.property('chatId', p01SupportChat02Id);
        expect(msg.params).to.have.property('deliveredDate', deliveredDate.toJSON());
        console.log('      ✓ patient01 <- messageDelivered');
      });
      console.log('      ✓ doctor05 -> messageDelivered');
    });
  });
  describe('WebSocket messageRead', () => {
    it('doctor05  -> messageRead, patient01 <- messageRead, doctor05  <- messageReadCallback', (done) => {
      const readDate = new Date();
      sendReq(wsD05, 'messageRead', {
        _id: newMessageId,
        readDate,
      }, (error, result) => {
        if (error) {
          expect(true, error).to.be.false();
          done();
          return;
        }
        expect(result).to.be.eq('success');
        console.log('      ✓ doctor05 <- messageReadCallback');
        done();
      });
      wsD05.once('message', handleMessage);
      wsP01.once('message', (msgStr) => {
        const msg = handleMessage(msgStr);
        expect(msg).to.have.property('method', 'messageRead');
        expect(msg).to.have.property('params');
        expect(msg.params).to.have.property('_id', newMessageId);
        expect(msg.params).to.have.property('chatId', p01SupportChat02Id);
        expect(msg.params).to.have.property('readDate', readDate.toJSON());
        console.log('      ✓ patient01 <- messageRead');
      });
      console.log('      ✓ doctor05 -> messageRead');
    });
  });
});
