'use strict';

process.env.NODE_ENV = 'test';

const log = require('logger-file-fun-line');
const chai = require('chai');
const chaiHttp = require('chai-http');
const test = require('./things/test')();
const {
  server,
  doctor01Cookie,
} = require('./things/values');

chai.should();
chai.use(chaiHttp);

describe('correct doctor logout', () => {
  describe('POST doctor auth/logout', () => {
    it('should remove access cookie when POST', async () => {
      const res = await chai.request(server)
        .post('/auth/logout')
        .set('host', 'doctor.telmed.ml')
        .set('Cookie', `dat=${doctor01Cookie}`);
      test(res, 'logout successful', { authCookieShould: false });
    });
  });
  describe('GET doctor auth/logout', () => {
    it('should remove access cookie when GET', async () => {
      const res = await chai.request(server)
        .get('/auth/logout')
        .set('host', 'doctor.telmed.ml')
        .set('Cookie', `dat=${doctor01Cookie}`);
      test(res, 'logout successful', { authCookieShould: false });
    });
  });
});
