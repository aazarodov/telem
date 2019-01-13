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

const email = 'telemedbackend@protonmail.com';
const lastName = 'Филичева';
const birthDate = '1987-04-03';

chai.should();
chai.use(chaiHttp);

describe('POST external/sendPDF', () => {
  describe('POST /external/sendPDF', () => {
    it('should successfully send PDF to email', async () => {
      const res = await chai.request(server)
        .post('/external/sendPDF')
        .send({
          barcode: p01barcode,
          email,
          lastName,
          birthDate,
        });
      test(res, 'PDF sent to email');
    });
    it('should throw sendPDF error when not_barcode', async () => {
      const res = await chai.request(server)
        .post('/external/sendPDF')
        .send({
          barcode: 'not_barcode',
          email,
          lastName,
          birthDate,
        });
      test(res, 400, 'sendPDF error');
    });
    it('should throw validate error when not_email', async () => {
      const res = await chai.request(server)
        .post('/external/sendPDF')
        .send({
          barcode: p01barcode,
          email: 'not_email',
          lastName,
          birthDate,
        });
      test(res, 400, 'validate error');
    });
    it('should throw sendPDF error when not_patient', async () => {
      const res = await chai.request(server)
        .post('/external/sendPDF')
        .send({
          barcode: p01barcode,
          email,
          lastName: 'not_patient',
          birthDate,
        });
      test(res, 400, 'sendPDF error');
    });
    it('should throw sendPDF error when 2000-01-01', async () => {
      const res = await chai.request(server)
        .post('/external/sendPDF')
        .send({
          barcode: p01barcode,
          email,
          lastName,
          birthDate: '2000-01-01',
        });
      test(res, 400, 'sendPDF error');
    });
    it('should throw validate error when no lastName', async () => {
      const res = await chai.request(server)
        .post('/external/sendPDF')
        .send({
          barcode: p01barcode,
          email,
          birthDate,
        });
      test(res, 400, 'validate error');
    });
    it('should throw validate error when no birthDate', async () => {
      const res = await chai.request(server)
        .post('/external/sendPDF')
        .send({
          barcode: p01barcode,
          email,
          lastName,
        });
      test(res, 400, 'validate error');
    });
  });
});
