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

const laboratoryAnalyzesId = 'doc.laboratoryAnalyzes|cb65b94d-fb11-11e8-8101-f41614cd568a';

describe('GET statusesOfAnalysis', () => {
  describe('GET /statusesOfAnalysis as Пушкин', () => {
    it('should return array statusesOfAnalysis', async () => {
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
        .get(`/statusesOfAnalysis?_id=${laboratoryAnalyzesId}`);
      res.status.should.eql(200);
      res.type.should.eql('application/json');
      res.body.status.should.eql('success');
      res.body.data['068a3e29-984b-4514-b57e-9e91b0b03623'].status.should.eql('ВРаботе');
      res.body.data['331328ac-01dd-4e86-a55f-3d3e75e515b2'].status.should.eql('ОжиданиеКонтроля');
      res.body.data['7723bb22-40fa-4efc-b61f-238377692f5c'].status.should.eql('Готов');
      res.body.data['7723bb22-40fa-4efc-b61f-238377692f5c'].result.should.eql(3.3);
      agent.close();
    });
  });
});
