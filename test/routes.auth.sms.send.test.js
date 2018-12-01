'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const log = require('logger-file-fun-line');
const server = require('../src/server/app');
const smsSeeding = require('../src/server/db/seeds/sms');

const should = chai.should();
chai.use(chaiHttp);

const postedMobileNumbers = {};

before(async () => {
  const smsSeeds = await smsSeeding();
  postedMobileNumbers.newNumber = {
    mobileNumber: '79543543543',
  };
  postedMobileNumbers.duplicateNumber = {
    mobileNumber: smsSeeds[0]._id,
  };
  postedMobileNumbers.expiredDuplicateNumber = {
    mobileNumber: smsSeeds[2]._id,
  };
});

describe('POST auth/sms/send', () => {
  describe('new mobileNumber', () => {
    it('should return smsToken', async () => {
      const res = await chai.request(server)
        .post('/auth/sms/send')
        .send(postedMobileNumbers.newNumber);
      res.status.should.equal(200);
      res.type.should.equal('application/json');
      res.body.status.should.eql('success');
      res.body.message.should.eql('sms successfully sent');
      should.exist(res.body.data.smsToken);
      should.exist(res.body.data.mobileNumber);
      should.exist(res.body.data.expiry);
      should.exist(res.body.data.smsCode);
    });
    it('should return error with repeated newNumber', async () => {
      const res = await chai.request(server)
        .post('/auth/sms/send')
        .send(postedMobileNumbers.duplicateNumber);
      res.status.should.equal(400);
      res.type.should.equal('application/json');
      res.body.status.should.eql('error');
      res.body.message.should.eql('sms already sent to this mobileNumber');
      should.not.exist(res.body.data);
    });
  });
  describe('duplicate mobileNumber', () => {
    it('should return error with duplicateNumber', async () => {
      const res = await chai.request(server)
        .post('/auth/sms/send')
        .send(postedMobileNumbers.duplicateNumber);
      res.status.should.equal(400);
      res.type.should.equal('application/json');
      res.body.status.should.eql('error');
      res.body.message.should.eql('sms already sent to this mobileNumber');
      should.not.exist(res.body.data);
    });
  });
  describe('expired duplicate mobileNumber', () => {
    it('should return smsToken', async () => {
      const res = await chai.request(server)
        .post('/auth/sms/send')
        .send(postedMobileNumbers.expiredDuplicateNumber);
      res.status.should.equal(200);
      res.type.should.equal('application/json');
      res.body.status.should.eql('success');
      res.body.message.should.eql('sms successfully sent');
      should.exist(res.body.data.smsToken);
      should.exist(res.body.data.mobileNumber);
      should.exist(res.body.data.expiry);
      should.exist(res.body.data.smsCode);
    });
  });
});