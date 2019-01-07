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

describe('GET cityNames', () => {
  describe('GET /cityNames as patient01', () => {
    it('should return array of cityNames', async () => {
      const res = await chai.request(server)
        .get('/cityNames')
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'cityNames list', { dataKeys: ['docs'] });
      res.body.data.docs.should.all.have.property('name');
    });
  });
});
