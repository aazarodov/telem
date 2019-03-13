/* eslint-disable no-console */

'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const WebSocket = require('ws');
const log = require('logger-file-fun-line');
const getId = require('uuid/v4');
const {
  server,
  doctor01Cookie,
  doctor05Cookie,
  doctor01Id,
  doctor05Id,
} = require('./things/values');

const { expect } = chai;
const callbacks = {};
let wsD01;
let wsD05;

const supportTitles = [
  'Запись на прием',
  'Лабораторные анализы',
  'Медицинские услуги',
];

after(() => {
  if (typeof wsD01.close === 'function') wsD01.close();
  if (typeof wsD05.close === 'function') wsD05.close();
});

const wsOptions = {
  protocol: 'jsonrpc-telem',
  headers: {
    host: 'patient.telmed.ml',
    cookie: `pat=${doctor01Cookie}`,
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

describe('WebSocket updateListeningSupportTitles', () => {
  describe('WebSocket connect', () => {
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
        expect(msg.params).to.have.property('meta', '');
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
  });
  describe('WebSocket updateListeningSupportTitles', () => {
    it('doctor05  -> updateListeningSupportTitles,\n      ✓ doctor05  <- updateListeningSupportTitlesChatCallback', (done) => {
      sendReq(wsD05, 'updateListeningSupportTitles', {
        supportTitles,
      }, (error, result) => {
        if (error) {
          expect(true, error).to.be.false();
          done();
          return;
        }
        expect(result).to.be.eq('success');
        console.log('      ✓ doctor05 <- updateListeningSupportTitlesCallback');
        done();
      });
      wsD05.once('message', handleMessage);
      console.log('      ✓ doctor05 -> updateListeningSupportTitles');
    });
    it('should trow error when supportTitle not correct', (done) => {
      sendReq(wsD05, 'updateListeningSupportTitles', {
        supportTitles: [...supportTitles, 'some_incorrect_title'],
      }, (error, result) => {
        if (error) {
          expect(error).to.be.eq('wrong supportTitle');
          console.log('      ✓ doctor05 <- updateListeningSupportTitlesCallback');
          done();
          return;
        }
        log(result);
        expect(true, 'This is pass incorrect supportTitle!').to.be.false();
        done();
      });
      wsD05.once('message', handleMessage);
      console.log('      ✓ doctor05 -> updateListeningSupportTitles');
    });
    it('should return updated meta.supportTitles on doctor05', async () => {
      const res = await chai.request(server)
        .get('/whoami')
        .set('host', 'doctor.telmed.ml')
        .set('Cookie', `dat=${doctor05Cookie}`);
      expect(res.body).to.have.property('message', 'You are Лавин Аврил Рамона');
      expect(res.body.data.doctor.meta.supportTitles).to.have.property(0, supportTitles[0]);
      expect(res.body.data.doctor.meta.supportTitles).to.have.property(1, supportTitles[1]);
      expect(res.body.data.doctor.meta.supportTitles).to.have.property(2, supportTitles[2]);
    });
    it('should return connected when doctor05 with updated meta', (done) => {
      if (typeof wsD05.close === 'function') wsD05.close();
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
        expect(msg.params.meta.supportTitles).to.have.property(0, supportTitles[0]);
        expect(msg.params.meta.supportTitles).to.have.property(1, supportTitles[1]);
        expect(msg.params.meta.supportTitles).to.have.property(2, supportTitles[2]);
        done();
      });
    });
    it('should throw error when doctor01 try updateListeningSupportTitles', (done) => {
      sendReq(wsD01, 'updateListeningSupportTitles', {
        supportTitles,
      }, (error, result) => {
        if (error) {
          expect(error).to.be.eq('only operator can listening for new supportChat');
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
