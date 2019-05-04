'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const log = require('logger-file-fun-line');
const { encrypt, encryptSync } = require('../src/server/utils/crypto');
const patients = require('../src/server/db/queries/patients');
const dateTime = require('../src/server/utils/dateTimeFor1C');
const test = require('./things/test')({ authCookieShould: false });
const {
  server,
  p01phoneNumber,
  p02phoneNumber,
  p03phoneNumber,
  p04phoneNumber,
  p02emailAddress,
  p03emailAddress,
  p04emailAddress,
  p02Password,
  p03NewPassword,
  p04Password,
  neverExpiry,
  alwaysExpired,
} = require('./things/values');

chai.should();
chai.use(chaiHttp);

const postedPatient = {
  email: p04emailAddress,
  password: p04Password,
  lastName: 'Булгаков',
  firstName: 'Михаил',
  middleName: 'Афанасьевич',
  sex: 'Мужской',
  birthDate: '1891-05-03T00:00:00',
  agreementOfSendingOtherInformation: false,
  agreementOfSendingResults: false,
  registerToken: encryptSync({ phoneNumber: p04phoneNumber, expiry: neverExpiry }),
};

describe('POST auth/register', () => {
  describe('add totaly new patient', () => {
    it('should throw error if password is too short', async () => {
      const res = await chai.request(server)
        .post('/auth/register')
        .send({ ...postedPatient, password: 'short' });
      test(res, 400, 'validate error');
    });
    it('should register a new patient wtih "Новый" status', async () => {
      const today = new Date();
      const res = await chai.request(server)
        .post('/auth/register')
        .send(postedPatient);
      test(res, 201, 'new patient created');
      const foundPatient = await patients.login(p04phoneNumber, p04Password);
      foundPatient.should.have.property('name', 'Булгаков Михаил Афанасьевич');
      foundPatient.should.have.property('agreementOfSendingOtherInformation', false);
      foundPatient.should.have.property('agreementOfSendingResults', false);
      foundPatient.should.have.nested.property('contactInformation[1].emailAddress', p04emailAddress);
      foundPatient.should.have.nested.property('status.presentation', 'Новый');
      foundPatient.should.have.property('note', `Дата создания: ${dateTime(today)}`);
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
      test(res, 400, 'patient with this phone number already exist');
    });
  });
  describe('existed patient without data mismatch', () => {
    it('should patient without mismatch', async () => {
      const today = new Date();
      const res = await chai.request(server)
        .post('/auth/register')
        .send({
          email: p03emailAddress,
          password: p03NewPassword,
          lastName: 'Ахматова',
          firstName: 'Анна',
          middleName: 'Андреевна',
          sex: 'Женский',
          birthDate: '1889-06-23',
          agreementOfSendingOtherInformation: false,
          agreementOfSendingResults: false,
          registerToken: await encrypt({ phoneNumber: p03phoneNumber, expiry: neverExpiry }),
        });
      test(res, 'stored patient updated without data mismatch');
      const foundPatient = await patients.login(p03phoneNumber, p03NewPassword);
      foundPatient.should.have.property('name', 'Ахматова Анна Андреевна');
      foundPatient.should.have.property('agreementOfSendingOtherInformation', false);
      foundPatient.should.have.property('agreementOfSendingResults', false);
      foundPatient.should.have.nested.property('contactInformation[1].emailAddress', p03emailAddress);
      foundPatient.should.have.nested.property('status.presentation', 'Активен');
      foundPatient.should.have.nested.property('city.presentation', 'Вологда');
      foundPatient.should.have.property('note', `Дата создания: ${dateTime(today)}`);
    });
  });
  describe('existed patient with data mismatch', () => {
    it('should add note with mismatching data', async () => {
      const today = new Date();
      const res = await chai.request(server)
        .post('/auth/register')
        .send({
          email: p02emailAddress,
          password: 'new_password',
          lastName: 'Бродский',
          firstName: 'Иосиф',
          middleName: 'Александрович',
          sex: 'Мужской',
          birthDate: '3000-05-21',
          agreementOfSendingOtherInformation: false,
          agreementOfSendingResults: false,
          registerToken: await encrypt({ phoneNumber: p02phoneNumber, expiry: neverExpiry }),
        });
      test(res, 'stored patient updated with data mismatch');
      const foundPatient = await patients.login(p02phoneNumber, p02Password);
      foundPatient.should.have.property('name', 'Бродский Иосиф Александрович');
      foundPatient.should.have.property('agreementOfSendingOtherInformation', true);
      foundPatient.should.have.property('agreementOfSendingResults', true);
      foundPatient.should.have.property('birthDate', '1940-05-24T00:00:00');
      foundPatient.should.have.nested.property('contactInformation[1].emailAddress', p02emailAddress);
      foundPatient.should.have.nested.property('status.presentation', 'Не активирован');
      foundPatient.should.have.nested.property('city.presentation', 'Вельск');
      foundPatient.should.have.property('avatar', '00000000-0000-1000-8000-000000000210');
      foundPatient.should.have.nested.property('family[0].patient.presentation', 'Пушкин Александр Сергеевич');
      foundPatient.should.have.property('note', `Дата создания: ${dateTime(today)} Несовпадающие данные: {"birthDate":"${dateTime('3000-05-21')}"}`);
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
      test(res, 400, 'registerToken incorrect');
    });
  });
  describe('registerToken expired', () => {
    it('should return registerToken expired', async () => {
      const res = await chai.request(server)
        .post('/auth/register')
        .send({
          ...postedPatient,
          registerToken: await encrypt({ phoneNumber: p02phoneNumber, expiry: alwaysExpired }),
        });
      test(res, 400, 'registerToken expired');
    });
  });
});
