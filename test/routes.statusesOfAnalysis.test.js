'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiThings = require('chai-things');
const log = require('logger-file-fun-line');
const server = require('../src/server/app');
const { patient01Cookie, p01laboratoryAnalyzesId } = require('./things/values');
const { test } = require('./things/utils');

chai.should();
chai.use(chaiThings);
chai.use(chaiHttp);

describe('GET statusesOfAnalysis', () => {
  describe('GET /statusesOfAnalysis as patient01', () => {
    it('should return associative array of status&result', async () => {
      const res = await chai.request(server)
        .get(`/statusesOfAnalysis?_id=${p01laboratoryAnalyzesId}`)
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'statusesOfAnalysis list');
      res.body.data['068a3e29-984b-4514-b57e-9e91b0b03623'].status.should.eql('ВРаботе');
      res.body.data['068a3e29-984b-4514-b57e-9e91b0b03623'].period.should.eql('2018-12-08T20:52:00');
      res.body.data['331328ac-01dd-4e86-a55f-3d3e75e515b2'].status.should.eql('ОжиданиеКонтроля');
      res.body.data['331328ac-01dd-4e86-a55f-3d3e75e515b2'].period.should.eql('2018-12-08T20:52:01');
      res.body.data['7723bb22-40fa-4efc-b61f-238377692f5c'].status.should.eql('Готов');
      res.body.data['7723bb22-40fa-4efc-b61f-238377692f5c'].period.should.eql('2018-12-10T00:06:49');
      res.body.data['7723bb22-40fa-4efc-b61f-238377692f5c'].result.should.eql(3.3);
    });
  });
});
