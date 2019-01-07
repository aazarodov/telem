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

describe('POST city', () => {
  describe('POST /patient/city as patient01', () => {
    it('should return success', async () => {
      const res = await chai.request(server)
        .post('/patient/city')
        .set('Cookie', `pat=${patient01Cookie}`)
        .send({ cityName: 'Котлас' });
      test(res, 'city updated');
    });
    it('should return error', async () => {
      const res = await chai.request(server)
        .post('/patient/city')
        .set('Cookie', `pat=${patient01Cookie}`)
        .send({ cityName: 'Москва' });
      test(res, 404, 'city not found');
    });
    it('should return city.presentation Котлас', async () => {
      const res = await chai.request(server)
        .get('/patient')
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'patient info', { data: { 'city.presentation': 'Котлас' } });
    });
  });
});
