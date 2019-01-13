'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const log = require('logger-file-fun-line');
const test = require('./things/test')({ authCookieShould: false });
const {
  server,
  p01barcode,
} = require('./things/values');

const lastName = 'Филичева';
const birthDate = '1987-04-03';

chai.should();
chai.use(chaiHttp);

describe('GET external/getPDF', () => {
  describe('GET /external/getPDF', () => {
    it('should return pdf file', async () => {
      const res = await chai.request(server)
        .get('/external/getPDF')
        .query({ barcode: p01barcode, lastName, birthDate });
      test(res, { type: 'application/pdf', bodyTest: false });
      res.should.have.header('content-length');
    });
    it('should throw getPDF error when not_barcode', async () => {
      const res = await chai.request(server)
        .get('/external/getPDF')
        .query({ barcode: 'not_barcode', lastName, birthDate });
      test(res, 400, 'getPDF error');
    });
    it('should throw getPDF error when not_patient', async () => {
      const res = await chai.request(server)
        .get('/external/getPDF')
        .query({ barcode: p01barcode, lastName: 'not_patient', birthDate });
      test(res, 400, 'getPDF error');
    });
    it('should throw getPDF error when 2000-01-01', async () => {
      const res = await chai.request(server)
        .get('/external/getPDF')
        .query({ barcode: p01barcode, lastName, birthDate: '2000-01-01' });
      test(res, 400, 'getPDF error');
    });
    it('should throw validate error when no lastName', async () => {
      const res = await chai.request(server)
        .get('/external/getPDF')
        .query({ barcode: p01barcode, birthDate });
      test(res, 400, 'validate error');
    });
    it('should throw validate error when no birthDate', async () => {
      const res = await chai.request(server)
        .get('/external/getPDF')
        .query({ barcode: p01barcode, lastName });
      test(res, 400, 'validate error');
    });
  });
});
