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
  d01Password,
  d02Password,
  d04Password,
  d05Login,
  d05Password,
} = require('./things/values');

const { expect } = chai;
chai.use(chaiHttp);

describe('POST doctor /auth/login', () => {
  describe('correct login', () => {
    it('should return access cookie', async () => {
      const agent = chai.request.agent(server);
      {
        const res = await agent
          .post('/auth/login')
          .set('host', 'doctor.telmed.ml')
          .send({ login: d01Login, password: d01Password });
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
        .post('/auth/login')
        .set('host', 'doctor.telmed.ml')
        .send({ login: d01Login, password: d01Password, remember: true });
      test(res, 'login successful');
      const cookieStr = res.header['set-cookie'][0];
      expect(cookieStr.substr(cookieStr.indexOf('expires=') + 8, 29)).to.be.eq('Thu, 01 Jan 3018 00:00:00 GMT');
    });
    it('should return meta', async () => {
      const agent = chai.request.agent(server);
      {
        const res = await agent
          .post('/auth/login')
          .set('host', 'doctor.telmed.ml')
          .send({ login: d05Login, password: d05Password });
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
  describe('incorrect login or password', () => {
    it('should return error if login not found', async () => {
      const res = await chai.request(server)
        .post('/auth/login')
        .set('host', 'doctor.telmed.ml')
        .send({ login: 'not_existed_login', password: d01Password });
      test(res, 404, 'doctor with this login and password not found, or noActive', { authCookieShould: false });
    });
    it('should return error if password not found', async () => {
      const res = await chai.request(server)
        .post('/auth/login')
        .set('host', 'doctor.telmed.ml')
        .send({ login: d01Login, password: 'not_existed_password' });
      test(res, 404, 'doctor with this login and password not found, or noActive', { authCookieShould: false });
    });
    it('should return error if login and password not match', async () => {
      const res = await chai.request(server)
        .post('/auth/login')
        .set('host', 'doctor.telmed.ml')
        .send({ login: d01Login, password: d02Password });
      test(res, 404, 'doctor with this login and password not found, or noActive', { authCookieShould: false });
    });
  });
  describe('incorrect login schema', () => {
    it('should return error if password field is absent', async () => {
      const res = await chai.request(server)
        .post('/auth/login')
        .set('host', 'doctor.telmed.ml')
        .send({ login: d01Login });
      test(res, 400, 'validate error', { authCookieShould: false });
    });
    it('should return error if login field is absent', async () => {
      const res = await chai.request(server)
        .post('/auth/login')
        .set('host', 'doctor.telmed.ml')
        .send({ password: d02Password });
      test(res, 400, 'validate error', { authCookieShould: false });
    });
    it('should return error if extra field are present', async () => {
      const res = await chai.request(server)
        .post('/auth/login')
        .set('host', 'doctor.telmed.ml')
        .send({ email: d01Login, password: d01Password });
      test(res, 400, 'validate error', { authCookieShould: false });
    });
  });
  describe('no active doctor', () => {
    it('should return error if doctor.noActive === true', async () => {
      const res = await chai.request(server)
        .post('/auth/login')
        .set('host', 'doctor.telmed.ml')
        .send({ login: d04Login, password: d04Password });
      test(res, 404, 'doctor with this login and password not found, or noActive', { authCookieShould: false });
    });
  });
});
