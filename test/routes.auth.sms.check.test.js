'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const log = require('logger-file-fun-line');
const server = require('../src/server/index');
// const sms = require('../src/server/db/queries/sms');
const smsSeeding = require('../src/server/db/seeds/sms');

const should = chai.should();
chai.use(chaiHttp);

const postedSmsTokens = {};

before(async () => {
  const smsSeeds = await smsSeeding();
  postedSmsTokens.allCorrect = {
    smsToken: smsSeeds[0].smsToken,
    smsCode: smsSeeds[0].smsCode,
  };
  postedSmsTokens.wrongCode = {
    smsToken: smsSeeds[1].smsToken,
    smsCode: '1100',
  };
  postedSmsTokens.wrongSign = {
    smsToken: 'H_F(E_F(Egf9-egf9-gf9--4g48fbvprbe',
    smsCode: smsSeeds[1].smsCode,
  };
  postedSmsTokens.expired = {
    smsToken: smsSeeds[2].smsToken,
    smsCode: smsSeeds[2].smsCode,
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
      // TODO request with this registerToken
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
