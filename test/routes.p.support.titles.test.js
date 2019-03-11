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

describe('GET supportTitles', () => {
  describe('GET /support/titles as patient01', () => {
    it('should return array of supportTitiles', async () => {
      const res = await chai.request(server)
        .get('/support/titles')
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'supportTitles list');
      res.body.data.should.have.lengthOf(4);
      res.body.data.should.have.property('0', 'Запись на прием');
    });
  });
  describe('GET /support/titles as patient01 again', () => {
    it('should return array of supportTitiles', async () => {
      const res = await chai.request(server)
        .get('/support/titles')
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'supportTitles list');
      res.body.data.should.have.lengthOf(4);
      res.body.data.should.have.property('0', 'Запись на прием');
    });
  });
});
