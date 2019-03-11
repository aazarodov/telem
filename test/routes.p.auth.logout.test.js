'use strict';

process.env.NODE_ENV = 'test';

const log = require('logger-file-fun-line');
const chai = require('chai');
const chaiHttp = require('chai-http');
const test = require('./things/test')();
const {
  server,
  patient01Cookie,
} = require('./things/values');

chai.should();
chai.use(chaiHttp);

describe('correct patient logout', () => {
  describe('POST patient auth/logout', () => {
    it('should remove access cookie when POST', async () => {
      const res = await chai.request(server)
        .post('/auth/logout')
        .set('host', 'doctor.telmed.ml')
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'logout successful', { authCookieShould: false });
    });
  });
  describe('GET patient auth/logout', () => {
    it('should remove access cookie when GET', async () => {
      const res = await chai.request(server)
        .get('/auth/logout')
        .set('host', 'doctor.telmed.ml')
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'logout successful', { authCookieShould: false });
    });
  });
});
