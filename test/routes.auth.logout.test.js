'use strict';

process.env.NODE_ENV = 'test';

const log = require('logger-file-fun-line');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../src/server/app');

chai.should();
chai.use(chaiHttp);

const postedPatientWtihPhone = {
  login: '79876543210',
  password: '1234567',
};

describe('POST auth/logout', () => {
  describe('correct logout', () => {
    it('should remove access cookie', async () => {
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
        .post('/auth/logout');
      res.status.should.equal(200);
      res.type.should.equal('application/json');
      res.body.status.should.eql('success');
      res.body.message.should.eql('logout successful');
      res.should.not.have.cookie('pat');
      agent.close();
    });
  });
});
