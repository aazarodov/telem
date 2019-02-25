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

describe('POST/DELETE avatar', () => {
  describe('POST /patient/avatar as patient01', () => {
    it('should return success', async () => {
      const res = await chai.request(server)
        .post('/patient/avatar')
        .set('Cookie', `pat=${patient01Cookie}`)
        .send({ fileId: '00000000-0000-1000-8000-000000000110' });
      test(res, 'avatar updated');
    });
    it('should return avatar 00000000-0000-1000-8000-000000000110', async () => {
      const res = await chai.request(server)
        .get('/patient')
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'patient info', { data: { avatar: '00000000-0000-1000-8000-000000000110' } });
    });
  });
  describe('DELETE /patient/avatar as patient01', () => {
    it('should return success', async () => {
      const res = await chai.request(server)
        .del('/patient/avatar')
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'avatar deleted');
    });
    it('should return avatar "" ', async () => {
      const res = await chai.request(server)
        .get('/patient')
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'patient info', { data: { avatar: '' } });
    });
  });
});
