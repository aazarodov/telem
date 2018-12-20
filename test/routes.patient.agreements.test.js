'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiThings = require('chai-things');
const log = require('logger-file-fun-line');
const server = require('../src/server/app');
const test = require('./things/test')();
const {
  patient01Cookie,
} = require('./things/values');


chai.should();
chai.use(chaiThings);
chai.use(chaiHttp);

describe('POST agreements', () => {
  describe('POST /patient/agreements as patient01', () => {
    it('should return success', async () => {
      const res = await chai.request(server)
        .post('/patient/agreements')
        .set('Cookie', `pat=${patient01Cookie}`)
        .send({ agreementOfSendingOtherInformation: false });
      test(res, 'agreements updated');
    });
    it('should return agreementOfSendingOtherInformation false', async () => {
      const res = await chai.request(server)
        .get('/patient')
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'patient info', { data: { agreementOfSendingOtherInformation: false } });
    });
  });
  describe('POST /patient/agreements as patient01 again', () => {
    it('should return success', async () => {
      const res = await chai.request(server)
        .post('/patient/agreements')
        .set('Cookie', `pat=${patient01Cookie}`)
        .send({
          agreementOfSendingOtherInformation: true,
          agreementOfSendingResults: true,
        });
      test(res, 'agreements updated');
    });
    it('should return both agreements true', async () => {
      const res = await chai.request(server)
        .get('/patient')
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'patient info', {
        data: {
          agreementOfSendingOtherInformation: true,
          agreementOfSendingResults: true,
        },
      });
    });
  });
});
