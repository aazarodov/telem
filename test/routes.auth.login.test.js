'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const log = require('logger-file-fun-line');
const server = require('../src/server/index');
// const patients = require('../src/server/db/queries/patients');
const patientSeeding = require('../src/server/db/seeds/patients');

const should = chai.should();
chai.use(chaiHttp);

before(async () => patientSeeding());

const postedPatientWtihPhone = {
  login: '79876543210',
  password: '1234567',
};

const postedPatientWtihMail = {
  ...postedPatientWtihPhone,
  login: 'alex@mail.ru',
};

const postedPatientIncorrectLogin = {
  ...postedPatientWtihPhone,
  login: 'not_existed_mail@mail.com',
};

const postedPatientIncorrectpassword = {
  ...postedPatientWtihPhone,
  password: 'not_existed_passwd',
};

const postedPatientIncorrectSchema1 = {
  login: '79876543210',
};

const postedPatientIncorrectSchema2 = {
  password: '1234567',
};

const postedPatientIncorrectSchema3 = {
  ...postedPatientWtihPhone,
  not_existed_field: 'hello there!',
};

const postedPatientWtihNoActiveStatus = {
  login: '18765432109',
  password: 'qwertyu',
};

describe('POST auth/login', () => {
  let accessToken;
  describe('correct login', () => {
    it('should return accessToken when login is phone number', async () => {
      const res = await chai.request(server)
        .post('/auth/login')
        .send(postedPatientWtihPhone);
      res.status.should.equal(200);
      res.type.should.equal('application/json');
      res.body.status.should.eql('success');
      res.body.message.should.eql('login successful');
      should.exist(res.body.data.accessToken);
      res.body.data.patient.firstName.should.eql('Александр');
      accessToken = res.body.data.accessToken; // eslint-disable-line prefer-destructuring
    });
    it('should return accessToken when login is email', async () => {
      const res = await chai.request(server)
        .post('/auth/login')
        .send(postedPatientWtihMail);
      res.status.should.equal(200);
      res.type.should.equal('application/json');
      res.body.status.should.eql('success');
      res.body.message.should.eql('login successful');
      should.exist(res.body.data.accessToken);
      res.body.data.patient.firstName.should.eql('Александр');
    });
  });
  describe('POST /whoami', () => {
    it('should return name', async () => {
      const res = await chai.request(server)
        .post('/whoami')
        .send({ accessToken });
      res.status.should.eql(200);
      res.type.should.eql('application/json');
      res.body.status.should.eql('success');
      res.body.message.should.eql('You are Пушкин Александр Сергеевич');
    });
  });
  describe('incorrect login or password', () => {
    it('should return error if login not found', async () => {
      const res = await chai.request(server)
        .post('/auth/login')
        .send(postedPatientIncorrectLogin);
      res.status.should.equal(404);
      res.type.should.equal('application/json');
      res.body.status.should.eql('error');
      res.body.message.should.eql('patient with this login and password not found');
      should.not.exist(res.body.data);
    });
    it('should return error if password not found', async () => {
      const res = await chai.request(server)
        .post('/auth/login')
        .send(postedPatientIncorrectpassword);
      res.status.should.equal(404);
      res.type.should.equal('application/json');
      res.body.status.should.eql('error');
      res.body.message.should.eql('patient with this login and password not found');
      should.not.exist(res.body.data);
    });
  });
  describe('incorrect login schema', () => {
    it('should return error if password field is absent', async () => {
      const res = await chai.request(server)
        .post('/auth/login')
        .send(postedPatientIncorrectSchema1);
      res.status.should.equal(400);
      res.type.should.equal('application/json');
      res.body.status.should.eql('error');
      res.body.message.should.eql('validate error');
      should.not.exist(res.body.data);
    });
    it('should return error if login field is absent', async () => {
      const res = await chai.request(server)
        .post('/auth/login')
        .send(postedPatientIncorrectSchema2);
      res.status.should.equal(400);
      res.type.should.equal('application/json');
      res.body.status.should.eql('error');
      res.body.message.should.eql('validate error');
      should.not.exist(res.body.data);
    });
    it('should return error if extra field are present', async () => {
      const res = await chai.request(server)
        .post('/auth/login')
        .send(postedPatientIncorrectSchema3);
      res.status.should.equal(400);
      res.type.should.equal('application/json');
      res.body.status.should.eql('error');
      res.body.message.should.eql('validate error');
      should.not.exist(res.body.data);
    });
  });
  describe('patient with statis not equal "Активен" ', () => {
    it('should return error statis !== "Активен"', async () => {
      const res = await chai.request(server)
        .post('/auth/login')
        .send(postedPatientWtihNoActiveStatus);
      res.status.should.equal(400);
      res.type.should.equal('application/json');
      res.body.status.should.eql('error');
      res.body.message.should.eql('patient not activeted');
      should.not.exist(res.body.data);
    });
  });
});
