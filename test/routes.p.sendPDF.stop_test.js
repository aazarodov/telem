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

describe('POST sendPDF', () => {
  describe('POST /sendPDF as patient01', () => {
    it('should successfully send PDF to patient01 email', async () => {
      const res = await chai.request(server)
        .post('/sendPDF')
        .set('Cookie', `pat=${patient01Cookie}`)
        .send({ barcode: p01barcode });
      test(res, 'PDF sent to email');
    });
    it('should throw sendPDF error', async () => {
      const res = await chai.request(server)
        .post('/sendPDF')
        .set('Cookie', `pat=${patient01Cookie}`)
        .send({ barcode: 'not_barcode' });
      test(res, 400, 'sendPDF error');
    });
  });
});
