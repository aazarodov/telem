'use strict';

process.env.NODE_ENV = 'test';

const log = require('logger-file-fun-line');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../src/server/app');
const test = require('./things/test')();
const {
  patient01Cookie,
} = require('./things/values');

chai.should();
chai.use(chaiHttp);

describe('correct logout', () => {
  describe('POST auth/logout', () => {
    it('should remove access cookie when POST', async () => {
      const res = await chai.request(server)
        .post('/auth/logout')
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'logout successful', { authCookieShould: false });
    });
  });
  describe('GET auth/logout', () => {
    it('should remove access cookie when GET', async () => {
      const res = await chai.request(server)
        .get('/auth/logout')
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'logout successful', { authCookieShould: false });
    });
  });
});
