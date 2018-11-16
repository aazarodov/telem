'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const log = require('logger-file-fun-line');
const server = require('../src/server/index');
const patients = require('../src/server/db/queries/patients');
const patientSeeding = require('../src/server/db/seeds/patients');
const dateTime = require('../src/server/utils/dateTimeFor1C');
const unixtimestamp = require('../src/server/utils/unixtimestamp');

const should = chai.should();
chai.use(chaiHttp);

before(async () => patientSeeding());

const postedPatient = {
  mobileNumber: '449835674532',
  email: 'michel@supermail.io',
  password: 'buzzword123',
  surname: 'Булгаков',
  firstName: 'Михаил',
  patronymic: 'Афанасьевич',
  sex: 'Мужской',
  birthDate: '1891-05-03',
  registerToken: 'f046271bb0a0112785af248d4105388c546e631ff4f5bcf1f3c84881780d1ca0',
  expiry: 1573882782,
};

describe('POST auth/register', () => {
  describe('add totaly new patient', () => {
    it('should throw error if password is too short', async () => {
      const res = await chai.request(server)
        .post('/auth/register')
        .send({ ...postedPatient, password: 'short' });
      res.status.should.equal(400);
      res.type.should.equal('application/json');
      res.body.status.should.eql('error');
      res.body.message.should.eql('validate error');
      res.body.error.message.should.eql('child "password" fails because ["password" length must be at least 6 characters long]');
    });
    it('should throw error if schema mismatch', async () => {
      const res = await chai.request(server)
        .post('/auth/register')
        .send({ ...postedPatient, Someting: 'thing' });
      res.status.should.equal(400);
      res.type.should.equal('application/json');
      res.body.status.should.eql('error');
      res.body.message.should.eql('validate error');
      res.body.error.message.should.eql('"Someting" is not allowed');
    });
    it('should register a new patient wtih "Активен" status', async () => {
      const today = new Date();
      const res = await chai.request(server)
        .post('/auth/register')
        .send(postedPatient);
      res.status.should.equal(201);
      res.type.should.equal('application/json');
      res.body.status.should.eql('success');
      res.body.message.should.eql('new patient created');
      res.body.data.ok.should.eql(true);
      should.exist(res.body.data.id);
      const foundPatient = await patients.getByPhone(postedPatient.mobileNumber);
      foundPatient._id.should.eql(res.body.data.id); // eslint-disable-line no-underscore-dangle
      foundPatient.email.should.eql(foundPatient.email);
      foundPatient.status.presentation.should.eql('Активен');
      foundPatient.note.should.eql(`Дата создания: ${dateTime(today)}`);
    });
  });
  describe('existed patient with "Активен" status', () => {
    it('should throw error if patient with "Активен" status already exist', async () => {
      const res = await chai.request(server)
        .post('/auth/register')
        .send({
          ...postedPatient,
          mobileNumber: '79876543210',
          registerToken: '89af27c05703b61defb01dc3559a50dd1b6a31ed124285b5fbf9db5e9f657888',
          expiry: 1573883490,
        });
      res.status.should.equal(400);
      res.type.should.equal('application/json');
      res.body.status.should.eql('error');
      res.body.message.should.eql('patient with this phone number already exist');
    });
  });
  describe('existed patient without data mismatch', () => {
    it('should add patronymic to patient data without mismatch', async () => {
      const today = new Date();
      const res = await chai.request(server)
        .post('/auth/register')
        .send({
          mobileNumber: '76005993445',
          email: 'ann@yahoo.com',
          password: 'new_password_not_detect_as_mismatch',
          surname: 'Ахматова',
          firstName: 'Анна',
          patronymic: 'Андреевна',
          sex: 'Женский',
          birthDate: '1889-06-23',
          registerToken: '026a29b8bc4246cdf50ab21454190eefaba96364c135f7d3b5f2118857cdd5fd',
          expiry: 1573883651,
        });
      res.status.should.equal(200);
      res.type.should.equal('application/json');
      res.body.status.should.eql('success');
      res.body.message.should.eql('stored patient updated without data mismatch');
      res.body.data.ok.should.eql(true);
      should.exist(res.body.data.id);
      const foundPatient = await patients.getByPhone('76005993445');
      foundPatient._id.should.eql(res.body.data.id); // eslint-disable-line no-underscore-dangle
      foundPatient.patronymic.should.eql('Андреевна');
      foundPatient.status.presentation.should.eql('Не активирован');
      foundPatient.note.should.eql(`Дата создания: ${dateTime(today)}`);
    });
    describe('existed patient with data mismatch', () => {
      it('should add note with mismatching data', async () => {
        const today = new Date();
        const res = await chai.request(server)
          .post('/auth/register')
          .send({
            mobileNumber: '18765432109',
            email: 'yosif@gmail.com',
            password: 'new_password_not_detect_as_mismatch',
            surname: 'Бродский',
            firstName: 'Иосиф',
            patronymic: 'Александрович',
            sex: 'Мужской',
            birthDate: '1940-05-21',
            registerToken: '8a9dfb54e4c9caa8667e5eca5569a5ae489f08d1c77d4afecbc33d207ce27e37',
            expiry: 1573883741,
          });
        res.status.should.equal(200);
        res.type.should.equal('application/json');
        res.body.status.should.eql('success');
        res.body.message.should.eql('stored patient updated with data mismatch');
        res.body.data.ok.should.eql(true);
        should.exist(res.body.data.id);
        const foundPatient = await patients.getByPhone('18765432109');
        foundPatient._id.should.eql(res.body.data.id); // eslint-disable-line no-underscore-dangle
        foundPatient.birthDate.should.eql('1940-05-24T00:00:00');
        foundPatient.status.presentation.should.eql('Не активирован');
        foundPatient.note.should.eql(`Дата создания: ${dateTime(today)} Несовпадающие данные: {"birthDate":"${dateTime('1940-05-21')}"}`);
      });
      describe('registerToken incorrect', () => {
        it('should return registerToken incorrect', async () => {
          const res = await chai.request(server)
            .post('/auth/register')
            .send({
              ...postedPatient,
              registerToken: '89af27c05703b61defb01dc3559a50dd1b6a31ed124285b5fbf9db5e9f657887',
              expiry: 1573883490,
            });
          res.status.should.equal(400);
          res.type.should.equal('application/json');
          res.body.status.should.eql('error');
          res.body.message.should.eql('registerToken incorrect');
        });
      });
      describe('registerToken expired', () => {
        it('should return registerToken expired', async () => {
          const res = await chai.request(server)
            .post('/auth/register')
            .send({
              ...postedPatient,
              expiry: unixtimestamp(),
            });
          res.status.should.equal(400);
          res.type.should.equal('application/json');
          res.body.status.should.eql('error');
          res.body.message.should.eql('registerToken expired');
        });
      });
    });
  });
});
