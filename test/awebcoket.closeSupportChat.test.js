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
  p01SupportChat01Id,
  p01SupportChat02Id,
  doctor01Cookie,
  patient01Id,
  doctor01Id,
  doctor05Id,
} = require('./things/values');

const wsOptions = {
  protocol: 'jsonrpc-telem',
  headers: {
    host: 'patient.telmed.ml',
    cookie: `pat=${patient01Cookie}`,
  },
};

let wsP01;
let wsD01;
let wsD05;

const { expect } = chai;
const callbacks = {};

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

after(() => {
  if (typeof wsP01.close === 'function') wsP01.close();
  if (typeof wsD01.close === 'function') wsD01.close();
  if (typeof wsD05.close === 'function') wsD05.close();
});

describe('WebSocket closeSupportChat', () => {
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
  describe('WebSocket closeSupportChat', () => {
    it('doctor05  -> closeSupportChat, patient01 <- supportChatClosed,\n      ✓ doctor05 <- supportChatClosed, doctor05  <- closeSupportChatCallback', (done) => {
      sendReq(wsD05, 'closeSupportChat', {
        _id: p01SupportChat02Id,
      }, (error, result) => {
        if (error) {
          expect(true, error).to.be.false();
          done();
          return;
        }
        expect(result).to.be.eq('success');
        console.log('      ✓ doctor05 <- closeSupportChatCallback');
        done();
      });
      wsD05.once('message', (msgStr) => {
        const msg = handleMessage(msgStr);
        expect(msg).to.have.property('method', 'supportChatClosed');
        expect(msg).to.have.property('params');
        expect(msg.params).to.have.property('_id', p01SupportChat02Id);
        expect(msg.params).to.have.property('closeDate');
        expect(msg.params).to.have.property('meta');
        console.log('      ✓ doctor05 <- closeSupportChat');
        wsD05.once('message', handleMessage);
      });
      wsP01.once('message', (msgStr) => {
        const msg = handleMessage(msgStr);
        expect(msg).to.have.property('method', 'supportChatClosed');
        expect(msg).to.have.property('params');
        expect(msg.params).to.have.property('_id', p01SupportChat02Id);
        expect(msg.params).to.have.property('closeDate');
        expect(msg.params).to.have.property('meta');
        console.log('      ✓ patient01 <- closeSupportChat');
      });
      console.log('      ✓ doctor05 -> closeSupportChat');
    });
    it('should throw error when doctor05 try to close not taken chat', (done) => {
      sendReq(wsD05, 'closeSupportChat', {
        _id: p01SupportChat01Id,
      }, (error, result) => {
        if (error) {
          expect(error).to.be.eq('access deny');
          done();
          return;
        }
        expect(result).to.be.eq('success');
        console.log('      ✓ doctor05 <- closeSupportChatCallback');
        done();
      });
      wsD05.once('message', handleMessage);
    });
    it('should throw error when doctor01 try to close any supportChat', (done) => {
      sendReq(wsD01, 'closeSupportChat', {
        _id: p01SupportChat01Id,
      }, (error, result) => {
        if (error) {
          expect(error).to.be.eq('supportChats for operator only');
          done();
          return;
        }
        expect(result).to.be.eq('success');
        console.log('      ✓ doctor01 <- closeSupportChatCallback');
        done();
      });
      wsD01.once('message', handleMessage);
    });
  });
});
