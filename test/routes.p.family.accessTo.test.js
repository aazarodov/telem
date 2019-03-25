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
  p02phoneNumber,
  patient02Id,
} = require('./things/values');


chai.should();
chai.use(chaiThings);
chai.use(chaiHttp);

describe('PUT POST DELETE family/accessTo', () => {
  describe('PUT /family/accessTo as patient01', () => {
    it('should return success', async () => {
      const res = await chai.request(server)
        .put('/family/accessTo')
        .set('Cookie', `pat=${patient01Cookie}`)
        .send({
          phoneNumber: p02phoneNumber,
          lastName: 'Бродский',
          firstName: 'Иосиф',
          middleName: 'Александрович',
          birthDate: '1940-05-24',
          relation: 'Другая',
          access: true,
        });
      test(res, 'accessTo added');
    });
    it('should return profile patient01 with patient02 on family', async () => {
      const res = await chai.request(server)
        .get('/patient')
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'patient info', { data: { name: 'Пушкин Александр Сергеевич' } });
      res.body.data.family[0].should.have.nested.property('relation.name', 'Другая');
      res.body.data.family[0].should.have.nested.property('relation.presentation', 'Другая');
      res.body.data.family[0].should.have.nested.property('relation.type', 'enm.typeOfRelations');
      res.body.data.family[0].should.have.nested.property('patient.ref', trimId(patient02Id));
      res.body.data.family[0].should.have.nested.property('patient.presentation', 'Бродский Иосиф Александрович');
      res.body.data.family[0].should.have.nested.property('patient.type', 'cat.patients');
      res.body.data.family[0].should.have.property('general', true);
      res.body.data.family[0].should.have.property('access', true);
    });
  });
  describe('POST /family/accessTo as patient01', () => {
    it('should return success', async () => {
      const res = await chai.request(server)
        .post('/family/accessTo')
        .set('Cookie', `pat=${patient01Cookie}`)
        .send({
          ref: trimId(patient02Id),
          relation: 'Супруг',
          access: false,
        });
      test(res, 'accessTo updated');
    });
    it('should return profile patient01 with patient02 on family', async () => {
      const res = await chai.request(server)
        .get('/patient')
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'patient info', { data: { name: 'Пушкин Александр Сергеевич' } });
      res.body.data.family[0].should.have.nested.property('relation.name', 'Супруг');
      res.body.data.family[0].should.have.nested.property('relation.presentation', 'Супруг');
      res.body.data.family[0].should.have.nested.property('relation.type', 'enm.typeOfRelations');
      res.body.data.family[0].should.have.nested.property('patient.ref', trimId(patient02Id));
      res.body.data.family[0].should.have.nested.property('patient.presentation', 'Бродский Иосиф Александрович');
      res.body.data.family[0].should.have.nested.property('patient.type', 'cat.patients');
      res.body.data.family[0].should.have.property('general', true);
      res.body.data.family[0].should.have.property('access', false);
    });
  });
  describe('DELETE /family/accessTo as patient01', () => {
    it('should return success', async () => {
      const res = await chai.request(server)
        .del('/family/accessTo')
        .set('Cookie', `pat=${patient01Cookie}`)
        .send({
          ref: trimId(patient02Id),
        });
      test(res, 'accessTo deleted');
    });
    it('should return profile patient01 without patient02 on family', async () => {
      const res = await chai.request(server)
        .get('/patient')
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'patient info', { data: { name: 'Пушкин Александр Сергеевич' } });
      res.body.data.family.should.have.lengthOf(0);
    });
  });
});
