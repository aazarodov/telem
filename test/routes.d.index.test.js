'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const log = require('logger-file-fun-line');
const {
  server,
} = require('./things/values');

chai.should();
chai.use(chaiHttp);

describe('routes : index', () => {
  describe('GET /', () => {
    it('should return test doctor index with d domain', async () => {
      const res = await chai.request(server)
        .get('/')
        .set('host', 'd.telmed.ml');
      res.status.should.eql(200);
      res.type.should.eql('application/json');
      res.body.status.should.eql('success');
      res.body.message.should.eql('test doctor index');
    });
    it('should return test doctor index with doc domain', async () => {
      const res = await chai.request(server)
        .get('/')
        .set('host', 'doc.telmed.ml');
      res.status.should.eql(200);
      res.type.should.eql('application/json');
      res.body.status.should.eql('success');
      res.body.message.should.eql('test doctor index');
    });
    it('should return test doctor index with doctor domain', async () => {
      const res = await chai.request(server)
        .get('/')
        .set('host', 'doctor.telmed.ml');
      res.status.should.eql(200);
      res.type.should.eql('application/json');
      res.body.status.should.eql('success');
      res.body.message.should.eql('test doctor index');
    });
  });
});
