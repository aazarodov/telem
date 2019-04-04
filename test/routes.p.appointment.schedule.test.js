'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiThings = require('chai-things');
const log = require('logger-file-fun-line');
const trimId = require('../src/server/utils/trimId');
const test = require('./things/test')();
const {
  server,
  patient01Cookie,
  doctor01Id,
} = require('./things/values');

const doctor01TrimId = trimId(doctor01Id);
const company01Id = '9010f2d8-dab7-11de-b21b-00140b0496c2';


chai.should();
chai.use(chaiThings);
chai.use(chaiHttp);

describe('GET /appointment/schedule', () => {
  describe('GET /appointment/schedule as patient01', () => {
    it('should return schedule tree on data field', async () => {
      const res = await chai.request(server)
        .get('/appointment/schedule')
        .query({
          specialist: doctor01TrimId,
          company: company01Id,
          dateGTE: '2019-04-02',
          dateLT: '2019-04-16T00:00:00.000Z',
        })
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'schedule tree');
      res.body.data['2019-04-03'].should.have.property('day', 3);
      res.body.data['2019-04-03'].should.have.property('begin', '09:00');
      res.body.data['2019-04-03'].should.have.property('end', '12:00');
      res.body.data['2019-04-03'].should.have.property('duration', '00:20');
      res.body.data['2019-04-03'].should.have.property('slots');
      res.body.data['2019-04-03'].slots['10:00'].should.have.property('begin', '10:00');
      res.body.data['2019-04-03'].slots['10:00'].should.have.property('end', '10:20');
      res.body.data['2019-04-03'].slots['10:00'].should.have.property('free', true);
      res.body.data['2019-04-03'].slots['10:20'].should.have.property('begin', '10:20');
      res.body.data['2019-04-03'].slots['10:20'].should.have.property('end', '10:40');
      res.body.data['2019-04-03'].slots['10:20'].should.have.property('free', false);

      res.body.data['2019-04-10'].should.have.property('day', 3);
      res.body.data['2019-04-10'].should.have.property('begin', '09:00');
      res.body.data['2019-04-10'].should.have.property('end', '10:00');
      res.body.data['2019-04-10'].should.have.property('duration', '00:10');
      res.body.data['2019-04-10'].should.have.property('slots');
      res.body.data['2019-04-10'].slots['09:10'].should.have.property('begin', '09:10');
      res.body.data['2019-04-10'].slots['09:10'].should.have.property('end', '09:20');
      res.body.data['2019-04-10'].slots['09:10'].should.have.property('free', false);
    });
    it('should return days error when dates are equal', async () => {
      const res = await chai.request(server)
        .get('/appointment/schedule')
        .query({
          specialist: doctor01TrimId,
          company: company01Id,
          dateGTE: '2019-04-02',
          dateLT: '2019-04-02',
        })
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 400, 'wrong number of days between dateGTE and dateLT');
    });
    it('should return days error when dateLT < dateGTE', async () => {
      const res = await chai.request(server)
        .get('/appointment/schedule')
        .query({
          specialist: doctor01TrimId,
          company: company01Id,
          dateGTE: '2019-04-02',
          dateLT: '2019-04-01',
        })
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 400, 'wrong number of days between dateGTE and dateLT');
    });
    it('should return days error when days between dates greater than limit', async () => {
      const res = await chai.request(server)
        .get('/appointment/schedule')
        .query({
          specialist: doctor01TrimId,
          company: company01Id,
          dateGTE: '2019-04-02',
          dateLT: '2019-06-04',
        })
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 400, 'too many days between dateGTE and dateLT');
    });
    it('should return null when schedule not found', async () => {
      const res = await chai.request(server)
        .get('/appointment/schedule')
        .query({
          specialist: doctor01TrimId,
          company: company01Id,
          dateGTE: '2000-01-01',
          dateLT: '2000-02-01',
        })
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'schedule tree');
      res.body.should.have.property('data', null);
    });
  });
});
