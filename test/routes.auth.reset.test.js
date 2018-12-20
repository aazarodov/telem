'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const log = require('logger-file-fun-line');
const server = require('../src/server/app');
const { encrypt } = require('../src/server/utils/crypto');
const test = require('./things/test')({ authCookieShould: false });
const {
  p01phoneNumber,
  p02phoneNumber,
  p01Password,
  neverExpiry,
} = require('./things/values');

chai.should();
chai.use(chaiHttp);

const newPassword = 'newPasswordABC123!@#';

describe('POST auth/reset', () => {
  describe('reset password', () => {
    it('should reset password when "Активен" status', async () => {
      const res = await chai.request(server)
        .post('/auth/reset')
        .send({
          password: newPassword,
          registerToken: await encrypt({ phoneNumber: p01phoneNumber, expiry: neverExpiry }),
        });
      test(res, 'reset password successful');
    });
    it('should login with new password', async () => {
      const res = await chai.request(server)
        .post('/auth/login')
        .send({
          login: p01phoneNumber,
          password: newPassword,
        });
      test(res, 'login successful', { dataKeys: ['patient'], authCookieShould: true });
      res.body.data.patient.should.have.property('lastName', 'Пушкин');
      res.body.data.patient.should.have.property('firstName', 'Александр');
      res.body.data.patient.should.have.property('middleName', 'Сергеевич');
    });
    it('should reset password back', async () => {
      const res = await chai.request(server)
        .post('/auth/reset')
        .send({
          password: p01Password,
          registerToken: await encrypt({ phoneNumber: p01phoneNumber, expiry: neverExpiry }),
        });
      test(res, 'reset password successful');
    });
    it('should login with old password', async () => {
      const res = await chai.request(server)
        .post('/auth/login')
        .send({
          login: p01phoneNumber,
          password: p01Password,
        });
      test(res, 'login successful', { dataKeys: ['patient'], authCookieShould: true });
      res.body.data.patient.should.have.property('lastName', 'Пушкин');
      res.body.data.patient.should.have.property('firstName', 'Александр');
      res.body.data.patient.should.have.property('middleName', 'Сергеевич');
    });
    it('should trow error when "Не активирован" status', async () => {
      const res = await chai.request(server)
        .post('/auth/reset')
        .send({
          password: newPassword,
          registerToken: await encrypt({ phoneNumber: p02phoneNumber, expiry: neverExpiry }),
        });
      test(res, 400, 'patient not activeted');
    });
  });
});
