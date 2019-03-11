'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const log = require('logger-file-fun-line');
const { encrypt } = require('../src/server/utils/crypto');
const test = require('./things/test')();
const {
  server,
  doctor01Id,
  doctor02Id,
  doctor01Cookie,
  patient01Cookie,
  neverExpiry,
  alwaysExpired,
} = require('./things/values');

chai.should();
chai.use(chaiHttp);

describe('test doctor accessToken using /whoami', () => {
  describe('GET doctor /whoami', () => {
    it('should return access deny, accessToken absent', async () => {
      const res = await chai.request(server)
        .get('/whoami')
        .set('host', 'doctor.telmed.ml');
      test(res, 403, 'access deny', { authCookieShould: false });
      res.body.should.have.property('error', 'accessToken absent');
    });
    it('should return access deny, accessToken incorrect', async () => {
      const res = await chai.request(server)
        .get('/whoami')
        .set('host', 'doctor.telmed.ml')
        .set('Cookie', 'dat=some_fake_access_token');
      test(res, 403, 'access deny', { authCookieShould: false });
      res.body.should.have.property('error', 'accessToken incorrect');
    });
    it('should return access deny, accessToken expired', async () => {
      const res = await chai.request(server)
        .get('/whoami')
        .set('host', 'doctor.telmed.ml')
        .set('Cookie', `dat=${await encrypt({ did: doctor01Id, expiry: alwaysExpired, type: 'doctor' })}`);
      test(res, 403, 'access deny', { authCookieShould: false });
      res.body.should.have.property('error', 'accessToken expired');
    });
    it('should return access deny, accessToken absent', async () => {
      const res = await chai.request(server)
        .get('/whoami')
        .set('host', 'doctor.telmed.ml')
        .set('Cookie', `pat=${doctor01Cookie}`);
      test(res, 403, 'access deny', { authCookieShould: false });
      res.body.should.have.property('error', 'accessToken absent');
    });
    it('should return access deny, accessToken wrong type', async () => {
      const res = await chai.request(server)
        .get('/whoami')
        .set('host', 'doctor.telmed.ml')
        .set('Cookie', `dat=${patient01Cookie}`);
      test(res, 403, 'access deny', { authCookieShould: false });
      res.body.should.have.property('error', 'accessToken wrong type');
    });
    it('should return success with doctor01Cookie', async () => {
      const res = await chai.request(server)
        .get('/whoami')
        .set('host', 'doctor.telmed.ml')
        .set('Cookie', `dat=${doctor01Cookie}`);
      test(res, 'You are Валентин Феликсович Войно-Ясенецкий');
    });
    it('should return success with patient01Cookie', async () => {
      const res = await chai.request(server)
        .get('/whoami')
        .set('host', 'doc.telmed.ml')
        .set('Cookie', `dat=${doctor01Cookie}`);
      test(res, 'You are Валентин Феликсович Войно-Ясенецкий');
    });
    it('should return success with doctor02Id', async () => {
      const res = await chai.request(server)
        .get('/whoami')
        .set('host', 'd.telmed.ml')
        .set('Cookie', `dat=${await encrypt({ did: doctor02Id, expiry: neverExpiry, type: 'doctor' })}`);
      test(res, 'You are Фёдоров Святослав Николаевич');
    });
    it('should return error 404 when subdomain qwerty', async () => {
      const res = await chai.request(server)
        .get('/whoami')
        .set('host', 'qwerty.telmed.ml')
        .set('Cookie', `dat=${doctor02Id}`);
      test(res, 404, { authCookieShould: false, bodyTest: false });
    });
  });
});
