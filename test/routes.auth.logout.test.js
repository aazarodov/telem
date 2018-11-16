'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../src/server/index');
// const patients = require('../src/server/db/queries/patients');
// const patientSeeding = require('../src/server/db/seeds/patients');

// const should = chai.should();
chai.use(chaiHttp);

// TODO accessToken seeding
// before(async () => patientSeeding());

describe('POST auth/logout', () => {
  describe('correct logout', () => {
    it('should remove accessToken from storage', async () => {
      const res = await chai.request(server)
        .post('/auth/logout')
        .send({ accessToken: 'accessTokenFromSeedNeeded' });
      res.status.should.equal(200);
      res.type.should.equal('application/json');
      res.body.status.should.eql('success');
      res.body.message.should.eql('logout successful');
      // TODO request with this accessToken should fail
    });
  });
  describe('incorrect logout schema', () => {
    it('should return error with empty accessToken', async () => {
      const res = await chai.request(server)
        .post('/auth/logout')
        .send({ accessToken: '' });
      res.status.should.equal(400);
      res.type.should.equal('application/json');
      res.body.status.should.eql('error');
      res.body.message.should.eql('validate error');
    });
  });
});
