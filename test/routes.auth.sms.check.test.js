'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const log = require('logger-file-fun-line');
const server = require('../src/server/app');
const { encrypt, decrypt } = require('../src/server/utils/crypto');
const { smsExpiry } = require('../secrets');
const unixtimestamp = require('../src/server/utils/unixtimestamp');
const test = require('./things/test')({ authCookieShould: false });
const {
  phoneNumber01,
  phoneNumber02,
  phoneNumber05New,
} = require('./things/values');

chai.should();
chai.use(chaiHttp);

const smsTokensAndCodes = {};

before(async () => {
  const now = unixtimestamp();
  const expiry = now + smsExpiry;
  smsTokensAndCodes.allCorrect = {
    smsToken: await encrypt({ phoneNumber: phoneNumber01, smsCode: '1111', expiry }),
    smsCode: '1111',
  };
  smsTokensAndCodes.wrongCode = {
    smsToken: await encrypt({ phoneNumber: phoneNumber02, smsCode: '2222', expiry }),
    smsCode: '0000',
  };
  smsTokensAndCodes.wrongSign = {
    smsToken: '8Q+DgA3//lN21FPwcofaT/s7GHInlpS8Ok+RbWUfj7A',
    smsCode: '3333',
  };
  smsTokensAndCodes.expired = {
    smsToken: await encrypt({ phoneNumber: phoneNumber05New, smsCode: '4444', expiry: (now - 1) }),
    smsCode: '4444',
  };
});

describe('POST auth/sms/check', () => {
  describe('smsTokensAndCodes.allCorrect', () => {
    it('should return registerToken', async () => {
      const res = await chai.request(server)
        .post('/auth/sms/check')
        .send(smsTokensAndCodes.allCorrect);
      test(res, 'smsCode correct', {
        dataKeys: ['registerToken', 'expiry'],
        dataNotKeys: ['smsCode'],
        data: { phoneNumber: phoneNumber01 },
      });
      const tokenData = await decrypt(res.body.data.registerToken);
      tokenData.should.have.property('phoneNumber', res.body.data.phoneNumber);
      tokenData.should.have.property('expiry', res.body.data.expiry);
    });
  });
  describe('smsTokensAndCodes.wrongCode', () => {
    it('should return smsCode incorrect', async () => {
      const res = await chai.request(server)
        .post('/auth/sms/check')
        .send(smsTokensAndCodes.wrongCode);
      test(res, 400, 'smsCode incorrect');
    });
  });
  describe('smsTokensAndCodes.wrongSign', () => {
    it('should return smsToken incorrect', async () => {
      const res = await chai.request(server)
        .post('/auth/sms/check')
        .send(smsTokensAndCodes.wrongSign);
      test(res, 400, 'smsToken incorrect');
    });
  });
  describe('smsTokensAndCodes.expared', () => {
    it('should return smsToken expired', async () => {
      const res = await chai.request(server)
        .post('/auth/sms/check')
        .send(smsTokensAndCodes.expired);
      test(res, 400, 'smsToken expired');
    });
  });
});
