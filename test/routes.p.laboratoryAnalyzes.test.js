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
  patient02Id,
  p02laboratoryAnalyzesId,
  patient03Id,
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
      res.body.data.docs.should.all.have.property('recipient');
      res.body.data.docs.should.all.have.property('oneTimeContractNumber');
      res.body.data.docs.should.all.have.property('analyzes');
      res.body.data.docs.should.all.have.property('PDFAvailable');
      res.body.data.docs[0].should.have.property('PDFAvailable', true);
      res.body.data.docs[0].analyzes.should.all.have.property('analyzesAndServices');
      res.body.data.docs[0].analyzes.should.all.have.property('normativ');
      res.body.data.docs[0].analyzes.should.all.have.property('result');
      res.body.data.docs[0].analyzes.should.all.have.property('approvalDateResult');
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
        dataKeys: ['_rev', 'date', 'barcode', 'recipient', 'oneTimeContractNumber', 'analyzes', 'PDFAvailable'],
      });
      res.body.data.analyzes.should.all.have.property('analyzesAndServices');
      res.body.data.analyzes.should.all.have.property('normativ');
      res.body.data.analyzes[1].should.have.property('result');
      res.body.data.analyzes[1].should.have.property('approvalDateResult');
    });
  });
  describe('GET /laboratoryAnalyzes doc patient02 as patient01', () => {
    it('should return laboratoryAnalysis patient02 on data field', async () => {
      const res = await chai.request(server)
        .get('/laboratoryAnalyzes')
        .query({ _id: p02laboratoryAnalyzesId, pid: patient02Id })
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'laboratoryAnalysis doc', {
        data: {
          _id: p02laboratoryAnalyzesId,
        },
        dataKeys: ['_rev', 'date', 'barcode', 'recipient', 'oneTimeContractNumber', 'analyzes', 'PDFAvailable'],
      });
      res.body.data.analyzes.should.all.have.property('analyzesAndServices');
      res.body.data.analyzes.should.all.have.property('normativ');
      res.body.data.analyzes[0].should.have.property('result');
      res.body.data.analyzes[0].should.have.property('approvalDateResult');
    });
  });
  describe('GET /laboratoryAnalyzes doc patient03 as patient01', () => {
    it('should return access deny', async () => {
      const res = await chai.request(server)
        .get('/laboratoryAnalyzes')
        .query({ _id: p01laboratoryAnalyzesId, pid: patient03Id })
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 403, 'pid access deny');
    });
  });
});
