'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiThings = require('chai-things');
const log = require('logger-file-fun-line');
const trimId = require('../src/server/utils/trimId');
const test = require('./things/test')();
const {
  server,
  patient01Cookie,
  patient01Id,
} = require('./things/values');

let patient01Bound01Id = null;

const patient01Bound01 = {
  lastName: 'Иванов',
  firstName: 'Иван',
  middleName: 'Иванович',
  birthDate: '1990-09-01',
  agreementOfSendingOtherInformation: true,
  agreementOfSendingResults: true,
};

chai.should();
chai.use(chaiThings);
chai.use(chaiHttp);

describe('POST family/register', () => {
  describe('POST /family/register as patient01', () => {
    it('should regisner new bound patient', async () => {
      const res = await chai.request(server)
        .post('/family/register')
        .set('Cookie', `pat=${patient01Cookie}`)
        .send({ ...patient01Bound01, sex: 'Мужской', relation: 'Ребенок' });
      test(res, 201, 'new bound patient created');
      res.body.data.should.have.property('_id');
    });
  });
  describe('GET /family/accessBy as patient01', () => {
    it('should return list of bound patients', async () => {
      const res = await chai.request(server)
        .get('/family/accessBy')
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'accessBy list');
      res.body.data.should.all.have.property('relation');
      res.body.data.should.all.have.property('patient');
      res.body.data.should.all.have.property('general');
      res.body.data.should.all.have.property('access');
      res.body.data.should.have.lengthOf(2);
      res.body.data[1].should.have.nested.property('relation.name', 'Ребенок');
      res.body.data[1].should.have.nested.property('patient.ref');
      res.body.data[1].should.have.property('general', true);
      res.body.data[1].should.have.property('access', true);
      patient01Bound01Id = res.body.data[1].patient.ref;
    });
  });
  describe('GET /patient new bound patient as patient01', () => {
    it('should return new bound patient profile', async () => {
      const res = await chai.request(server)
        .get('/patient')
        .query({ pid: patient01Bound01Id })
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'patient info', {
        data: {
          ...patient01Bound01,
          birthDate: '1990-09-01T00:00:00',
          class_name: 'cat.patients',
        },
        dataKeys: ['sex', 'family'],
        dataNotKeys: ['_id', '_rev', 'id', 'rev', 'status', 'password', 'note'],
      });
      res.body.data.sex.should.have.property('name', 'Мужской');
      res.body.data.sex.should.have.property('presentation', 'Мужской');
      res.body.data.sex.should.have.property('type', 'enm.typesOfSex');
      res.body.data.family[0].should.have.nested.property('relation.name', 'Родитель');
      res.body.data.family[0].should.have.nested.property('relation.presentation', 'Родитель');
      res.body.data.family[0].should.have.nested.property('relation.type', 'enm.typeOfRelations');
      res.body.data.family[0].should.have.nested.property('patient.ref', trimId(patient01Id));
      res.body.data.family[0].should.have.nested.property('patient.presentation', 'Пушкин Александр Сергеевич');
      res.body.data.family[0].should.have.nested.property('patient.type', 'cat.patients');
      res.body.data.family[0].should.have.property('general', true);
      res.body.data.family[0].should.have.property('access', true);
    });
  });
});
