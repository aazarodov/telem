'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const log = require('logger-file-fun-line');
const server = require('../src/server/app');

chai.should();
chai.use(chaiHttp);


describe('routes : index', () => {
  describe('GET /', () => {
    it('should return json', async () => {
      const res = await chai.request(server)
        .get('/');
      res.status.should.eql(200);
      res.type.should.eql('application/json');
      res.body.status.should.eql('success');
      res.body.message.should.eql('index');
    });
  });
});
