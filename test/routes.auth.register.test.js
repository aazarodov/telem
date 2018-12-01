'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const log = require('logger-file-fun-line');
const server = require('../src/server/app');
const patients = require('../src/server/db/queries/patients');
const ramSeeding = require('../src/server/db/seeds/hw_0_ram');
const dateTime = require('../src/server/utils/dateTimeFor1C');

const should = chai.should();
chai.use(chaiHttp);

before(async () => ramSeeding());

const postedPatientMobileNumber = '449835674532';
const postedPatient = {
  email: 'michel@supermail.io',
  password: 'buzzword123',
  surname: 'Булгаков',
  firstName: 'Михаил',
  patronymic: 'Афанасьевич',
  sex: 'Мужской',
  birthDate: '1891-05-03T00:00:00',
  registerToken: '+WhgTLE+3E7hiKE1FAX/wm+pYP56KKIwEAta73DQ/p2dHatcbPhQQaz5YFivMfVib21mqpLNuVEyygsbBnGi4JTrAarIDNZJRvFRu8Z5ZH8=',
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
      const foundPatient = await patients.getByMobileNumber(postedPatientMobileNumber);
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
          // mobileNumber: '79876543210',
          registerToken: 'OItCwkoq3j7ROvkzRgT25LF30jewUB6Iv1bNsq00Mw/5LMkG6JvuR2u2opRqcxWviW8FDnb6iSNstMMEkhcQcqn0FglkwtYT2MP/C4fzrZw=',
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
          // mobileNumber: '76005993445',
          email: 'ann@yahoo.com',
          password: 'new_password_not_detect_as_mismatch',
          surname: 'Ахматова',
          firstName: 'Анна',
          patronymic: 'Андреевна',
          sex: 'Женский',
          birthDate: '1889-06-23',
          registerToken: 'crVw64nc++3ccLJSs7WVZowPbvI9gMmuE2byfTQsGdkhyQAvFCODVn+IqIrc0aAabOS14nZ8cLGDg5FXJLSAKEbEj80X2ejLO2FRSLFtH00=',
        });
      res.status.should.equal(200);
      res.type.should.equal('application/json');
      res.body.status.should.eql('success');
      res.body.message.should.eql('stored patient updated without data mismatch');
      res.body.data.ok.should.eql(true);
      should.exist(res.body.data.id);
      const foundPatient = await patients.getByMobileNumber('76005993445');
      foundPatient._id.should.eql(res.body.data.id);
      foundPatient.middleName.should.eql('Андреевна');
      foundPatient.status.presentation.should.eql('Не активирован');
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
          password: 'new_password_not_detect_as_mismatch',
          surname: 'Бродский',
          firstName: 'Иосиф',
          patronymic: 'Александрович',
          sex: 'Мужской',
          birthDate: '1940-05-21',
          registerToken: 'JmY83YjuUCw8091eTq24BVWHlw/p8tEC8mXPnovLt4eAgLkhR24no7eQ+e2CbU6cuwP+zvttBP/dnIAt9PzA8J7yMBbQZJxUeiYVkN3eng4=',
        });
      res.status.should.equal(200);
      res.type.should.equal('application/json');
      res.body.status.should.eql('success');
      res.body.message.should.eql('stored patient updated with data mismatch');
      res.body.data.ok.should.eql(true);
      should.exist(res.body.data.id);
      const foundPatient = await patients.getByMobileNumber('78765432109');
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
          registerToken: 'B0iq9jyb4xDWxHcUpaLwLslnfWS+tYCtwTHcTLGtvLHE/GWtLgF1kbHjPtXsW1KpQOgADusfurHIo/AKix6Mjn0m7pv8EFYVHG1uMI1aujU=',
        });
      res.status.should.equal(400);
      res.type.should.equal('application/json');
      res.body.status.should.eql('error');
      res.body.message.should.eql('registerToken expired');
    });
  });
});
