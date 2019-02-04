'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiThings = require('chai-things');
const log = require('logger-file-fun-line');
const test = require('./things/test')();
const {
  server,
  patient01Cookie,
} = require('./things/values');


chai.should();
chai.use(chaiThings);
chai.use(chaiHttp);

describe('GET family/accessBy', () => {
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
      res.body.data.should.have.lengthOf(1);
    });
  });
});
