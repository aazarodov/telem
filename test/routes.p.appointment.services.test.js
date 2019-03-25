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

describe('GET /appointment/services', () => {
  describe('GET /appointment/services as patient01', () => {
    it('should return array of services', async () => {
      const res = await chai.request(server)
        .get('/appointment/services')
        .query({
          chaild: false,
        })
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'services list');
      res.body.data.should.all.have.property('_id');
      res.body.data.should.all.have.property('child', false);
      res.body.data.should.all.have.property('presentation');
      res.body.data.should.all.have.property('doctors');
      res.body.data[0].doctors.should.all.have.property('_id');
      res.body.data[0].doctors.should.all.have.property('name');
    });
  });
});
