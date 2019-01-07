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
  p01laboratoryAnalyzesId,
} = require('./things/values');


chai.should();
chai.use(chaiThings);
chai.use(chaiHttp);

describe('GET laboratoryAnalyzes', () => {
  describe('GET /laboratoryAnalyzes list as patient01', () => {
    it('should return array of laboratoryAnalyzes on data.docs field', async () => {
      const res = await chai.request(server)
        .get('/laboratoryAnalyzes')
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'laboratoryAnalyzes list', { dataKeys: ['docs', 'bookmark'] });
      res.body.data.docs.should.all.have.property('_id');
      res.body.data.docs.should.all.have.property('_rev');
      res.body.data.docs.should.all.have.property('date');
      res.body.data.docs.should.all.have.property('barcode');
      res.body.data.docs.should.all.have.property('oneTimeContractNumber');
      res.body.data.docs.should.all.have.property('analyzes');
    });
  });
  describe('GET /laboratoryAnalyzes doc as patient01', () => {
    it('should return laboratoryAnalysis on data field', async () => {
      const res = await chai.request(server)
        .get('/laboratoryAnalyzes')
        .query({ _id: p01laboratoryAnalyzesId })
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'laboratoryAnalysis doc', {
        data: {
          _id: p01laboratoryAnalyzesId,
        },
        dataKeys: ['_rev', 'date', 'barcode', 'oneTimeContractNumber', 'analyzes'],
      });
    });
  });
});
