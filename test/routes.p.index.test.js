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
    it('should return test patient index without domain', async () => {
      const res = await chai.request(server)
        .get('/');
      res.status.should.eql(200);
      res.type.should.eql('application/json');
      res.body.status.should.eql('success');
      res.body.message.should.eql('test patient index');
    });
    it('should return test patient index with p domain', async () => {
      const res = await chai.request(server)
        .get('/')
        .set('host', 'p.telmed.ml');
      res.status.should.eql(200);
      res.type.should.eql('application/json');
      res.body.status.should.eql('success');
      res.body.message.should.eql('test patient index');
    });
    it('should return test patient index with pat domain', async () => {
      const res = await chai.request(server)
        .get('/')
        .set('host', 'pat.telmed.ml');
      res.status.should.eql(200);
      res.type.should.eql('application/json');
      res.body.status.should.eql('success');
      res.body.message.should.eql('test patient index');
    });
    it('should return test patient index with patient domain', async () => {
      const res = await chai.request(server)
        .get('/')
        .set('host', 'patient.telmed.ml');
      res.status.should.eql(200);
      res.type.should.eql('application/json');
      res.body.status.should.eql('success');
      res.body.message.should.eql('test patient index');
    });
  });
});
