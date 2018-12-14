'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const log = require('logger-file-fun-line');
const server = require('../src/server/app');
const smsSeeding = require('../src/server/db/seeds/sms');
const { test, setDef } = require('./things/utils');
const {
  phoneNumber01,
  phoneNumber03Expired,
  phoneNumber05New,
} = require('./things/values');

chai.should();
chai.use(chaiHttp);

setDef({ authCookieTest: false });

before(async () => {
  await smsSeeding();
});

describe('POST auth/sms/send', () => {
  describe('new phoneNumber', () => {
    it('should return smsToken', async () => {
      const res = await chai.request(server)
        .post('/auth/sms/send')
        .send({ phoneNumber: phoneNumber05New });
      test(res, 'sms successfully sent', {
        dataKeys: ['smsToken', 'phoneNumber', 'expiry'],
        dataNotKeys: ['smsCode'],
      });
    });
    it('should return error with repeated newNumber', async () => {
      const res = await chai.request(server)
        .post('/auth/sms/send')
        .send({ phoneNumber: phoneNumber05New });
      test(res, 400, 'sms already sent to this phoneNumber');
    });
  });
  describe('duplicate phoneNumber', () => {
    it('should return error with duplicateNumber', async () => {
      const res = await chai.request(server)
        .post('/auth/sms/send')
        .send({ phoneNumber: phoneNumber01 });
      test(res, 400, 'sms already sent to this phoneNumber');
    });
  });
  describe('expired duplicate phoneNumber', () => {
    it('should return smsToken', async () => {
      const res = await chai.request(server)
        .post('/auth/sms/send')
        .send({ phoneNumber: phoneNumber03Expired });
      test(res, 'sms successfully sent', {
        dataKeys: ['smsToken', 'phoneNumber', 'expiry'],
        dataNotKeys: ['smsCode'],
      });
    });
  });
});
