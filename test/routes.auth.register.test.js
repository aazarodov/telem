'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const log = require('logger-file-fun-line');
const server = require('../src/server/app');
const { encrypt, encryptSync } = require('../src/server/utils/crypto');
const unixtimestamp = require('../src/server/utils/unixtimestamp');
const patients = require('../src/server/db/queries/patients');
const dateTime = require('../src/server/utils/dateTimeFor1C');

const {
  p01phoneNumber,
  p02phoneNumber,
  p03phoneNumber,
  p04phoneNumber,
  p01Password,
  newPassword,
  neverExpiry,
} = require('./things/values');

const should = chai.should();
chai.use(chaiHttp);

const postedPatient = {
  email: 'michel@supermail.io',
  password: 'buzzword123',
  lastName: 'Булгаков',
  firstName: 'Михаил',
  middleName: 'Афанасьевич',
  sex: 'Мужской',
  birthDate: '1891-05-03T00:00:00',
  registerToken: encryptSync({ phoneNumber: p04phoneNumber, expiry: neverExpiry }),
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
    it('should register a new patient wtih "Новый" status', async () => {
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
      const foundPatient = await patients.getByphoneNumber(p04phoneNumber);
      foundPatient._id.should.eql(res.body.data.id);
      foundPatient.contactInformation[1].emailAddress.should.eql(postedPatient.email);
      foundPatient.status.presentation.should.eql('Новый');
      foundPatient.note.should.eql(`Дата создания: ${dateTime(today)}`);
    });
  });
  describe('existed patient with "Активен" status', () => {
    it('should throw error if patient with "Активен" status already exist', async () => {
      const res = await chai.request(server)
        .post('/auth/register')
        .send({
          ...postedPatient,
          registerToken: await encrypt({ phoneNumber: p01phoneNumber, expiry: neverExpiry }),
        });
      res.status.should.equal(400);
      res.type.should.equal('application/json');
      res.body.status.should.eql('error');
      res.body.message.should.eql('patient with this phone number already exist');
    });
  });
  describe('existed patient without data mismatch', () => {
    it('should add middleName to patient data without mismatch', async () => {
      const today = new Date();
      const res = await chai.request(server)
        .post('/auth/register')
        .send({
          email: 'ann@yahoo.com',
          password: 'new_password_not_detect_as_mismatch',
          lastName: 'Ахматова',
          firstName: 'Анна',
          middleName: 'Андреевна',
          sex: 'Женский',
          birthDate: '1889-06-23',
          registerToken: await encrypt({ phoneNumber: p03phoneNumber, expiry: neverExpiry }),
        });
      res.status.should.equal(200);
      res.type.should.equal('application/json');
      res.body.status.should.eql('success');
      res.body.message.should.eql('stored patient updated without data mismatch');
      res.body.data.ok.should.eql(true);
      should.exist(res.body.data.id);
      const foundPatient = await patients.getByphoneNumber(p03phoneNumber);
      foundPatient._id.should.eql(res.body.data.id);
      foundPatient.middleName.should.eql('Андреевна');
      foundPatient.status.presentation.should.eql('Активен');
      foundPatient.note.should.eql(`Дата создания: ${dateTime(today)}`);
    });
  });
  describe('existed patient with data mismatch', () => {
    it('should add note with mismatching data', async () => {
      const today = new Date();
      const res = await chai.request(server)
        .post('/auth/register')
        .send({
          email: 'yosif@gmail.com',
          password: 'new_password',
          lastName: 'Бродский',
          firstName: 'Иосиф',
          middleName: 'Александрович',
          sex: 'Мужской',
          birthDate: '1940-05-21',
          registerToken: await encrypt({ phoneNumber: p02phoneNumber, expiry: neverExpiry }),
        });
      res.status.should.equal(200);
      res.type.should.equal('application/json');
      res.body.status.should.eql('success');
      res.body.message.should.eql('stored patient updated with data mismatch');
      res.body.data.ok.should.eql(true);
      should.exist(res.body.data.id);
      const foundPatient = await patients.getByphoneNumber(p02phoneNumber);
      foundPatient._id.should.eql(res.body.data.id);
      foundPatient.birthDate.should.eql('1940-05-24T00:00:00');
      foundPatient.status.presentation.should.eql('Не активирован');
      foundPatient.note.should.eql(`Дата создания: ${dateTime(today)} Несовпадающие данные: {"birthDate":"${dateTime('1940-05-21')}"}`);
    });
  });
  describe('registerToken incorrect', () => {
    it('should return registerToken incorrect', async () => {
      const res = await chai.request(server)
        .post('/auth/register')
        .send({
          ...postedPatient,
          registerToken: '89af27c05703b61defb01dc3559a50dd1b6a31ed124285b5fbf9db5e9f657887',
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
          registerToken: await encrypt({ phoneNumber: p02phoneNumber, expiry: unixtimestamp - 1 }),
        });
      res.status.should.equal(400);
      res.type.should.equal('application/json');
      res.body.status.should.eql('error');
      res.body.message.should.eql('registerToken expired');
    });
  });
});
