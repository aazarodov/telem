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
    ...smsSeeds[0],
  };
  postedSmsTokens.wrongCode = {
    ...smsSeeds[1],
    smsCode: '1100',
  };
  postedSmsTokens.wrongSign = {
    ...smsSeeds[1],
    smsToken: smsSeeds[0].smsToken,
  };
  postedSmsTokens.expired = {
    ...smsSeeds[2],
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
