'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const log = require('logger-file-fun-line');
const server = require('../src/server/app');
const { encrypt, decrypt } = require('../src/server/utils/crypto');
const { smsExpiry } = require('../secrets');
const unixtimestamp = require('../src/server/utils/unixtimestamp');

const should = chai.should();
chai.use(chaiHttp);

const postedSmsTokens = {};

before(async () => {
  const now = unixtimestamp();
  const expiry = now + smsExpiry;
  postedSmsTokens.allCorrect = {
    smsToken: await encrypt({ mobileNumber: '7987654321', smsCode: '1111', expiry }),
    smsCode: '1111',
  };
  postedSmsTokens.wrongCode = {
    smsToken: await encrypt({ mobileNumber: '79008007612', smsCode: '2222', expiry }),
    smsCode: '0000',
  };
  postedSmsTokens.wrongSign = {
    smsToken: '8Q+DgA3//lN21FPwcofaT/s7GHInlpS8Ok+RbWUfj7A',
    smsCode: '3333',
  };
  postedSmsTokens.expired = {
    smsToken: await encrypt({ mobileNumber: '7987654321', smsCode: '4444', expiry: (now - 1) }),
    smsCode: '4444',
  };
});

describe('POST auth/sms/check', () => {
  describe('postedSmsTokens.allCorrect', () => {
    it('should return registerToken', async () => {
      const res = await chai.request(server)
        .post('/auth/sms/check')
        .send(postedSmsTokens.allCorrect);
      res.status.should.equal(200);
      res.type.should.equal('application/json');
      res.body.status.should.eql('success');
      res.body.message.should.eql('smsCode correct');
      should.exist(res.body.data.registerToken);
      should.exist(res.body.data.mobileNumber);
      should.exist(res.body.data.expiry);
      const tokenData = await decrypt(res.body.data.registerToken);
      tokenData.mobileNumber.should.equal(res.body.data.mobileNumber);
      tokenData.expiry.should.equal(res.body.data.expiry);
    });
  });
  describe('postedSmsTokens.wrongCode', () => {
    it('should return smsCode incorrect', async () => {
      const res = await chai.request(server)
        .post('/auth/sms/check')
        .send(postedSmsTokens.wrongCode);
      res.status.should.equal(400);
      res.type.should.equal('application/json');
      res.body.status.should.eql('error');
      res.body.message.should.eql('smsCode incorrect');
      should.not.exist(res.body.data);
    });
  });
  describe('postedSmsTokens.wrongSign', () => {
    it('should return smsToken incorrect', async () => {
      const res = await chai.request(server)
        .post('/auth/sms/check')
        .send(postedSmsTokens.wrongSign);
      res.status.should.equal(400);
      res.type.should.equal('application/json');
      res.body.status.should.eql('error');
      res.body.message.should.eql('smsToken incorrect');
      should.not.exist(res.body.data);
    });
  });
  describe('postedSmsTokens.expared', () => {
    it('should return smsToken expired', async () => {
      const res = await chai.request(server)
        .post('/auth/sms/check')
        .send(postedSmsTokens.expired);
      res.status.should.equal(400);
      res.type.should.equal('application/json');
      res.body.status.should.eql('error');
      res.body.message.should.eql('smsToken expired');
      should.not.exist(res.body.data);
    });
  });
});
