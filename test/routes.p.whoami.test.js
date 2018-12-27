'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const log = require('logger-file-fun-line');
const { encrypt } = require('../src/server/utils/crypto');
const test = require('./things/test')();
const {
  server,
  patient01Id,
  patient02Id,
  patient01Cookie,
  neverExpiry,
  alwaysExpired,
} = require('./things/values');

chai.should();
chai.use(chaiHttp);

describe('Test accessToken using /whoami', () => {
  describe('GET /whoami without access', () => {
    it('should return access deny, accessToken absent', async () => {
      const res = await chai.request(server)
        .get('/whoami')
        .set('Host', 'patient.telem.ml');
      test(res, 403, 'access deny', { authCookieShould: false });
      res.body.should.have.property('error', 'accessToken absent');
    });
    it('should return access deny, accessToken incorrect', async () => {
      const res = await chai.request(server)
        .get('/whoami')
        .set('Host', 'pat.telem.ml')
        .set('Cookie', 'pat=some_fake_access_token');
      test(res, 403, 'access deny', { authCookieShould: false });
      res.body.should.have.property('error', 'accessToken incorrect');
    });
    it('should return access deny, accessToken expired', async () => {
      const res = await chai.request(server)
        .get('/whoami')
        .set('Host', 'p.telem.ml')
        .set('Cookie', `pat=${await encrypt({ pid: patient01Id, expiry: alwaysExpired })}`);
      test(res, 403, 'access deny', { authCookieShould: false });
      res.body.should.have.property('error', 'accessToken expired');
    });
    it('should return success with patient01Cookie', async () => {
      const res = await chai.request(server)
        .get('/whoami')
        .set('Host', 'p.telem.ml')
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'You are Пушкин Александр Сергеевич');
    });
    it('should return success with patient02Id', async () => {
      const res = await chai.request(server)
        .get('/whoami')
        .set('Host', 'p.telem.ml')
        .set('Cookie', `pat=${await encrypt({ pid: patient02Id, expiry: neverExpiry })}`);
      test(res, 'You are Бродский Иосиф Александрович');
    });
    it('should return error 404 when subdomain qwerty', async () => {
      const res = await chai.request(server)
        .get('/whoami')
        .set('Host', 'qwerty.telem.ml')
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 404, { authCookieShould: false, bodyTest: false });
    });
  });
});
