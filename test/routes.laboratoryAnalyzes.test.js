'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiThings = require('chai-things');
const log = require('logger-file-fun-line');
const server = require('../src/server/app');

chai.should();
chai.use(chaiThings);
chai.use(chaiHttp);

const postedPatientWtihPhone = {
  login: '79876543210', // Пушкин Александр Сергеевич
  password: '1234567',
};

describe('GET laboratoryAnalyzes', () => {
  describe('GET /laboratoryAnalyzes as Пушкин', () => {
    it('should return array laboratoryAnalyzes on data.docs field', async () => {
      const agent = chai.request.agent(server);
      {
        const res = await agent
          .post('/auth/login')
          .send(postedPatientWtihPhone);
        res.status.should.equal(200);
        res.type.should.equal('application/json');
        res.body.status.should.eql('success');
        res.body.message.should.eql('login successful');
        res.should.have.cookie('pat');
        res.body.data.patient.firstName.should.eql('Александр');
      }
      const res = await agent
        .get('/laboratoryAnalyzes');
      res.status.should.eql(200);
      res.type.should.eql('application/json');
      res.body.status.should.eql('success');
      res.body.data.docs.should.all.have.property('oneTimeContractNumber');
      res.body.data.docs.should.all.have.property('date');
      res.body.data.docs.should.all.have.property('analyzes');
      agent.close();
    });
  });
  describe('GET /laboratoryAnalyzes without access', () => {
    it('should return access deny, accessToken absent', async () => {
      const res = await chai.request(server)
        .get('/laboratoryAnalyzes');
      res.status.should.eql(400);
      res.type.should.eql('application/json');
      res.body.status.should.eql('error');
      res.body.message.should.eql('access deny');
      res.body.error.should.eql('accessToken absent');
    });
    it('should return access deny, accessToken incorrect', async () => {
      const res = await chai.request(server)
        .get('/laboratoryAnalyzes')
        .set('Cookie', 'pat=some_fake_access_token');
      res.status.should.eql(400);
      res.type.should.eql('application/json');
      res.body.status.should.eql('error');
      res.body.message.should.eql('access deny');
      res.body.error.should.eql('accessToken incorrect');
    });
    it('should return access deny, accessToken expired', async () => {
      const res = await chai.request(server)
        .get('/laboratoryAnalyzes')
        .set('Cookie', 'pat=ru4rwoicpxHvbVAcX18bichWxVJ+YB+rIEkXCvkafhyMkAJLT6lWeJyz/kO7Fk4XIK/6uARUorOxC14sI4K8xA==');
      res.status.should.eql(400);
      res.type.should.eql('application/json');
      res.body.status.should.eql('error');
      res.body.message.should.eql('access deny');
      res.body.error.should.eql('accessToken expired');
    });
  });
});
