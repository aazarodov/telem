'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiThings = require('chai-things');
const log = require('logger-file-fun-line');
const test = require('./things/test')();
const {
  server,
  doctor01Cookie,
  doctor05Cookie,
  d01Login,
  d01Password,
  d05Login,
  d05Password,
} = require('./things/values');

chai.should();
chai.use(chaiThings);
chai.use(chaiHttp);

describe('GET supportTitles', () => {
  describe('GET /support/titles as doctor01 by cookie from values', () => {
    it('should return access error', async () => {
      const res = await chai.request(server)
        .get('/support/titles')
        .set('host', 'doctor.telmed.ml')
        .set('Cookie', `dat=${doctor01Cookie}`);
      test(res, 403, 'access deny', { authCookieShould: false });
      res.body.should.have.property('error', 'accessToken wrong doctor group');
    });
  });
  describe('GET /support/titles as doctor01 by login password', () => {
    it('should return access error', async () => {
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
      }
      const res = await agent
        .get('/support/titles')
        .set('host', 'doctor.telmed.ml');
      test(res, 403, 'access deny', { authCookieShould: false });
      res.body.should.have.property('error', 'accessToken wrong doctor group');
    });
  });
  describe('GET /support/titles as doctor05 by cookie from values', () => {
    it('should return array of supportTitiles', async () => {
      const res = await chai.request(server)
        .get('/support/titles')
        .set('host', 'doctor.telmed.ml')
        .set('Cookie', `dat=${doctor05Cookie}`);
      test(res, 'supportTitles list');
      res.body.data.should.have.lengthOf(4);
      res.body.data.should.have.property('0', 'Запись на прием');
    });
  });
  describe('GET /support/titles as doctor05 by login password', () => {
    it('should return access error', async () => {
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
      }
      const res = await agent
        .get('/support/titles')
        .set('host', 'doctor.telmed.ml');
      test(res, 'supportTitles list');
      res.body.data.should.have.lengthOf(4);
      res.body.data.should.have.property('0', 'Запись на прием');
    });
  });
});
