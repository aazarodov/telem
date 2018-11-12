'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../src/server/index');
const patients = require('../src/server/db/queries/patients');
const patientSeeding = require('../src/server/db/seeds/patients');

const should = chai.should();
chai.use(chaiHttp);

before(async () => patientSeeding());

const postedPatient = {
  phone_numbers: '449835674532',
  email: 'michel@supermail.io',
  Password: 'buzzword123',
  Surname: 'Булгаков',
  FirstName: 'Михаил',
  Patronymic: 'Афанасьевич',
  sex: 'Мужской',
  birth_date: '1891-05-03',
};

describe('POST auth/register', () => {
  describe('add totaly new patient', () => {
    it('should throw error if password is too short', async () => {
      const res = await chai.request(server)
        .post('/auth/register')
        .send({ ...postedPatient, Password: 'short' });
      res.status.should.equal(400);
      res.type.should.equal('application/json');
      res.body.status.should.eql('error');
      res.body.message.should.eql('register post data validate error');
      res.body.error.should.eql('child "Password" fails because ["Password" length must be at least 6 characters long]');
    });
    it('should throw error if schema mismatch', async () => {
      const res = await chai.request(server)
        .post('/auth/register')
        .send({ ...postedPatient, Someting: 'thing' });
      res.status.should.equal(400);
      res.type.should.equal('application/json');
      res.body.status.should.eql('error');
      res.body.message.should.eql('register post data validate error');
      res.body.error.should.eql('"Someting" is not allowed');
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
      const foundPatient = await patients.getByPhone(postedPatient.phone_numbers);
      foundPatient._id.should.eql(res.body.data.id); // eslint-disable-line no-underscore-dangle
      foundPatient.email.should.eql(foundPatient.email);
      foundPatient.status.should.eql('Активен');
      foundPatient.note.should.eql(`Дата создания: ${today.toISOString().substring(0, 10)}`);
    });
  });
  describe('existed patient with "Активен" status', () => {
    it('should throw error if patient with "Активен" status already exist', async () => {
      const res = await chai.request(server)
        .post('/auth/register')
        .send({ ...postedPatient, phone_numbers: '79876543210' });
      res.status.should.equal(400);
      res.type.should.equal('application/json');
      res.body.status.should.eql('error');
      res.body.message.should.eql('patient with this phone number already exist');
    });
  });
  describe('existed patient without data mismatch', () => {
    it('should add Patronymic to patient data without mismatch', async () => {
      const today = new Date();
      const res = await chai.request(server)
        .post('/auth/register')
        .send({
          phone_numbers: '76005993445',
          email: 'ann@yahoo.com',
          Password: 'new_password_not_detect_as_mismatch',
          Surname: 'Ахматова',
          FirstName: 'Анна',
          Patronymic: 'Андреевна',
          sex: 'Женский',
          birth_date: '1889-06-23',
        });
      res.status.should.equal(200);
      res.type.should.equal('application/json');
      res.body.status.should.eql('success');
      res.body.message.should.eql('stored patient updated without data mismatch');
      res.body.data.ok.should.eql(true);
      should.exist(res.body.data.id);
      const foundPatient = await patients.getByPhone('76005993445');
      foundPatient._id.should.eql(res.body.data.id); // eslint-disable-line no-underscore-dangle
      foundPatient.Patronymic.should.eql('Андреевна');
      foundPatient.status.should.eql('требуется модерация');
      foundPatient.note.should.eql(`Дата создания: ${today.toISOString().substring(0, 10)}`);
    });
    describe('existed patient with data mismatch', () => {
      it('should add note with mismatching data', async () => {
        const today = new Date();
        const res = await chai.request(server)
          .post('/auth/register')
          .send({
            phone_numbers: '18765432109',
            email: 'yosif@gmail.com',
            Password: 'new_password_not_detect_as_mismatch',
            Surname: 'Бродский',
            FirstName: 'Иосиф',
            Patronymic: 'Александрович',
            sex: 'Мужской',
            birth_date: '1940-05-21',
          });
        res.status.should.equal(200);
        res.type.should.equal('application/json');
        res.body.status.should.eql('success');
        res.body.message.should.eql('stored patient updated with data mismatch');
        res.body.data.ok.should.eql(true);
        should.exist(res.body.data.id);
        const foundPatient = await patients.getByPhone('18765432109');
        foundPatient._id.should.eql(res.body.data.id); // eslint-disable-line no-underscore-dangle
        foundPatient.birth_date.should.eql('1940-05-24');
        foundPatient.status.should.eql('Не активирован, требуется модерация');
        foundPatient.note.should.eql(`Дата создания: ${today.toISOString().substring(0, 10)} Несовпадающие данные: {"birth_date":"1940-05-21"}`);
      });
    });
  });
});
