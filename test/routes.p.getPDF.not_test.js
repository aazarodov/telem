'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const log = require('logger-file-fun-line');
const test = require('./things/test')();
const {
  server,
  patient01Cookie,
  p01barcode,
} = require('./things/values');

chai.should();
chai.use(chaiHttp);

describe('GET getPDF', () => {
  describe('GET /getPDF as patient01', () => {
    it('should return pdf file', async () => {
      const res = await chai.request(server)
        .get('/getPDF')
        .query({ barcode: p01barcode })
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, { type: 'application/pdf', bodyTest: false });
      res.should.have.header('content-length');
    });
    it('should throw getPDF error when not_barcode', async () => {
      const res = await chai.request(server)
        .get('/getPDF')
        .query({ barcode: 'not_barcode' })
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 400, 'getPDF error');
    });
  });
});
