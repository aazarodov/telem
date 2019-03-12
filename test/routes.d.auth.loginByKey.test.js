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
  d05Login,
} = require('./things/values');
const {
  oneSKey,
} = require('../secrets');

const { expect } = chai;
chai.use(chaiHttp);

describe('POST doctor /auth/loginByKey', () => {
  describe('correct login', () => {
    it('should return access cookie', async () => {
      const agent = chai.request.agent(server);
      {
        const res = await agent
          .post('/auth/loginByKey')
          .set('host', 'doctor.telmed.ml')
          .send({ login: d01Login, key: oneSKey });
        test(res, 'login successful', { dataKeys: ['doctor'] });
        res.body.data.doctor.should.have.property('name', 'Валентин Феликсович Войно-Ясенецкий');
        res.body.data.doctor.should.have.property('specialization', 'Хирург');
        res.body.data.doctor.should.have.property('group', 'doctor');
        res.body.data.doctor.should.have.property('childDoctor');
        res.body.data.doctor.should.have.property('adultDoctor');
        res.body.data.doctor.should.have.property('meta');
      }
      const res = await agent
        .get('/whoami')
        .set('host', 'doctor.telmed.ml');
      test(res, 'You are Валентин Феликсович Войно-Ясенецкий');
      res.body.data.doctor.should.have.property('name', 'Валентин Феликсович Войно-Ясенецкий');
      res.body.data.doctor.should.have.property('specialization', 'Хирург');
      res.body.data.doctor.should.have.property('group', 'doctor');
      res.body.data.doctor.should.have.property('childDoctor');
      res.body.data.doctor.should.have.property('adultDoctor');
      res.body.data.doctor.should.have.property('meta');
      agent.close();
    });
    it('should return return neverExpiry cookie', async () => {
      const res = await chai.request(server)
        .post('/auth/loginByKey')
        .set('host', 'doctor.telmed.ml')
        .send({ login: d01Login, key: oneSKey, remember: true });
      test(res, 'login successful');
      const cookieStr = res.header['set-cookie'][0];
      expect(cookieStr.substr(cookieStr.indexOf('expires=') + 8, 29)).to.be.eq('Thu, 01 Jan 3018 00:00:00 GMT');
    });
    it('should return meta', async () => {
      const agent = chai.request.agent(server);
      {
        const res = await agent
          .post('/auth/loginByKey')
          .set('host', 'doctor.telmed.ml')
          .send({ login: d05Login, key: oneSKey });
        test(res, 'login successful', { dataKeys: ['doctor'] });
        res.body.data.doctor.should.have.property('name', 'Лавин Аврил Рамона');
        res.body.data.doctor.should.have.property('specialization', 'Медицинская сестра');
        res.body.data.doctor.should.have.property('group', 'operator');
        res.body.data.doctor.should.have.property('childDoctor');
        res.body.data.doctor.should.have.property('adultDoctor');
        res.body.data.doctor.should.have.property('meta');
        res.body.data.doctor.meta.should.have.property('supportTitles');
        res.body.data.doctor.meta.supportTitles.should.have.property(0, 'Запись на прием');
        res.body.data.doctor.meta.supportTitles.should.have.property(1, 'Медицинские услуги');
      }
      const res = await agent
        .get('/whoami')
        .set('host', 'doctor.telmed.ml');
      test(res, 'You are Лавин Аврил Рамона');
      res.body.data.doctor.should.have.property('name', 'Лавин Аврил Рамона');
      res.body.data.doctor.should.have.property('specialization', 'Медицинская сестра');
      res.body.data.doctor.should.have.property('group', 'operator');
      res.body.data.doctor.should.have.property('childDoctor');
      res.body.data.doctor.should.have.property('adultDoctor');
      res.body.data.doctor.should.have.property('meta');
      res.body.data.doctor.meta.should.have.property('supportTitles');
      res.body.data.doctor.meta.supportTitles.should.have.property(0, 'Запись на прием');
      res.body.data.doctor.meta.supportTitles.should.have.property(1, 'Медицинские услуги');
      agent.close();
    });
  });
  describe('incorrect login or key', () => {
    it('should return error if login not found', async () => {
      const res = await chai.request(server)
        .post('/auth/loginByKey')
        .set('host', 'doctor.telmed.ml')
        .send({ login: 'not_existed_login', key: oneSKey });
      test(res, 404, 'doctor with this login not found, or noActive', { authCookieShould: false });
    });
    it('should return error if key not match', async () => {
      const res = await chai.request(server)
        .post('/auth/loginByKey')
        .set('host', 'doctor.telmed.ml')
        .send({ login: d01Login, key: 'not_existed_key' });
      test(res, 403, 'wrong key', { authCookieShould: false });
    });
  });
  describe('incorrect login schema', () => {
    it('should return error if key field is absent', async () => {
      const res = await chai.request(server)
        .post('/auth/loginByKey')
        .set('host', 'doctor.telmed.ml')
        .send({ login: d01Login, password: oneSKey });
      test(res, 400, 'validate error', { authCookieShould: false });
    });
    it('should return error if login field is absent', async () => {
      const res = await chai.request(server)
        .post('/auth/loginByKey')
        .set('host', 'doctor.telmed.ml')
        .send({ key: oneSKey });
      test(res, 400, 'validate error', { authCookieShould: false });
    });
  });
  describe('no active doctor', () => {
    it('should return error if doctor.noActive === true', async () => {
      const res = await chai.request(server)
        .post('/auth/loginByKey')
        .set('host', 'doctor.telmed.ml')
        .send({ login: d04Login, key: oneSKey });
      test(res, 404, 'doctor with this login not found, or noActive', { authCookieShould: false });
    });
  });
});
