'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const log = require('logger-file-fun-line');
const test = require('./things/test')();
const {
  server,
  d01Login,
  d04Login,
} = require('./things/values');
const {
  oneSKey,
} = require('../secrets');

chai.should();
chai.use(chaiHttp);

describe('POST doctor /auth/loginByKey', () => {
  describe('correct login', () => {
    it('should return access cookie', async () => {
      const agent = chai.request.agent(server);
      {
        const res = await agent
          .post('/auth/loginByKey')
          .set('host', 'doctor.telem.ml')
          .send({ login: d01Login, key: oneSKey });
        test(res, 'login successful', { dataKeys: ['doctor'] });
        res.body.data.doctor.should.have.property('name', 'Валентин Феликсович Войно-Ясенецкий');
        res.body.data.doctor.should.have.property('specialization', 'Хирург');
      }
      const res = await agent
        .get('/whoami')
        .set('host', 'doctor.telem.ml');
      test(res, 'You are Валентин Феликсович Войно-Ясенецкий');
      agent.close();
    });
  });
  describe('incorrect login or key', () => {
    it('should return error if login not found', async () => {
      const res = await chai.request(server)
        .post('/auth/loginByKey')
        .set('host', 'doctor.telem.ml')
        .send({ login: 'not_existed_login', key: oneSKey });
      test(res, 404, 'doctor with this login not found, or noActive', { authCookieShould: false });
    });
    it('should return error if key not match', async () => {
      const res = await chai.request(server)
        .post('/auth/loginByKey')
        .set('host', 'doctor.telem.ml')
        .send({ login: d01Login, key: 'not_existed_key' });
      test(res, 403, 'wrong key', { authCookieShould: false });
    });
  });
  describe('incorrect login schema', () => {
    it('should return error if key field is absent', async () => {
      const res = await chai.request(server)
        .post('/auth/loginByKey')
        .set('host', 'doctor.telem.ml')
        .send({ login: d01Login, password: oneSKey });
      test(res, 400, 'validate error', { authCookieShould: false });
    });
    it('should return error if login field is absent', async () => {
      const res = await chai.request(server)
        .post('/auth/loginByKey')
        .set('host', 'doctor.telem.ml')
        .send({ key: oneSKey });
      test(res, 400, 'validate error', { authCookieShould: false });
    });
  });
  describe('no active doctor', () => {
    it('should return error if doctor.noActive === true', async () => {
      const res = await chai.request(server)
        .post('/auth/loginByKey')
        .set('host', 'doctor.telem.ml')
        .send({ login: d04Login, key: oneSKey });
      test(res, 404, 'doctor with this login not found, or noActive', { authCookieShould: false });
    });
  });
});
