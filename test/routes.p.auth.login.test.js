'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const log = require('logger-file-fun-line');
const test = require('./things/test')();
const {
  server,
  p01phoneNumber,
  p01emailAddress,
  p01Password,
  p02phoneNumber,
  p02Password,

} = require('./things/values');

chai.should();
chai.use(chaiHttp);

const postedPatientWtihPhone = {
  login: p01phoneNumber,
  password: p01Password,
};

const postedPatientWtihMail = {
  ...postedPatientWtihPhone,
  login: p01emailAddress,
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
  login: p01phoneNumber,
};

const postedPatientIncorrectSchema2 = {
  password: p01Password,
};

const postedPatientIncorrectSchema3 = {
  ...postedPatientWtihPhone,
  not_existed_field: 'hello there!',
};

const postedPatientWtihNoActivetedStatus = {
  login: p02phoneNumber,
  password: p02Password,
};

describe('POST auth/login', () => {
  describe('correct login', () => {
    it('should return access cookie when login is phone number', async () => {
      const agent = chai.request.agent(server);
      {
        const res = await agent
          .post('/auth/login')
          .send(postedPatientWtihPhone);
        test(res, 'login successful');
      }
      const res = await agent
        .get('/whoami');
      test(res, 'You are Пушкин Александр Сергеевич');
      agent.close();
    });
    it('should return access cookie when login is email', async () => {
      const res = await chai.request(server)
        .post('/auth/login')
        .send(postedPatientWtihMail);
      test(res, 'login successful');
    });
  });
  describe('incorrect login or password', () => {
    it('should return error if login not found', async () => {
      const res = await chai.request(server)
        .post('/auth/login')
        .send(postedPatientIncorrectLogin);
      test(res, 404, 'patient with this login and password not found', { authCookieShould: false });
    });
    it('should return error if password not found', async () => {
      const res = await chai.request(server)
        .post('/auth/login')
        .send(postedPatientIncorrectpassword);
      test(res, 404, 'patient with this login and password not found', { authCookieShould: false });
    });
  });
  describe('incorrect login schema', () => {
    it('should return error if password field is absent', async () => {
      const res = await chai.request(server)
        .post('/auth/login')
        .send(postedPatientIncorrectSchema1);
      test(res, 400, 'validate error', { authCookieShould: false });
    });
    it('should return error if login field is absent', async () => {
      const res = await chai.request(server)
        .post('/auth/login')
        .send(postedPatientIncorrectSchema2);
      test(res, 400, 'validate error', { authCookieShould: false });
    });
    it('should return error if extra field are present', async () => {
      const res = await chai.request(server)
        .post('/auth/login')
        .send(postedPatientIncorrectSchema3);
      test(res, 400, 'validate error', { authCookieShould: false });
    });
  });
  describe('patient with status not equal "Активен" or "Новый"', () => {
    it('should return error with message "patient not activeted"', async () => {
      const res = await chai.request(server)
        .post('/auth/login')
        .send(postedPatientWtihNoActivetedStatus);
      test(res, 400, 'patient not activeted', { authCookieShould: false });
    });
  });
});
