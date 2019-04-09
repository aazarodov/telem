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

describe('POST /appointment/record', () => {
  describe('POST /appointment/record as patient01', () => {
    it('should return appointment record created', async () => {
      const res = await chai.request(server)
        .post('/appointment/record')
        .set('Cookie', `pat=${patient01Cookie}`)
        .send({
          service: '749221f7-45a5-11e9-8102-fa32b2a877f7',
          specialist: '30274264-4cf3-11e3-b321-001517b46888',
          company: '59f239a6-0383-4689-a625-419b486d1746',
          beginOfAppointment: '2019-06-10T09:03:00',
          endOfAppointment: '2019-06-10T09:04:00',
        });
      test(res, 'appointment record created');
    });
    it('should return appointment already taken', async () => {
      const res = await chai.request(server)
        .post('/appointment/record')
        .set('Cookie', `pat=${patient01Cookie}`)
        .send({
          service: '749221f7-45a5-11e9-8102-fa32b2a877f7',
          specialist: '30274264-4cf3-11e3-b321-001517b46888',
          company: '59f239a6-0383-4689-a625-419b486d1746',
          beginOfAppointment: '2019-06-10T09:01:00',
          endOfAppointment: '2019-06-10T09:02:00',
        });
      test(res, 400, 'appointment already taken');
    });
    it('should return appointment record error', async () => {
      const res = await chai.request(server)
        .post('/appointment/record')
        .set('Cookie', `pat=${patient01Cookie}`)
        .send({
          service: '00000000-0000-1000-8000-000001000001',
          specialist: '30274264-4cf3-11e3-b321-001517b46888',
          company: '59f239a6-0383-4689-a625-419b486d1746',
          beginOfAppointment: '2019-06-10T09:01:00',
          endOfAppointment: '2019-06-10T09:02:00',
        });
      test(res, 400, 'appointment record error');
      res.body.should.have.property('error', '{service: \'Объект не найден\'}');
    });
  });
});
