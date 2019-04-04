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
  p01appointment01Id,
} = require('./things/values');


chai.should();
chai.use(chaiThings);
chai.use(chaiHttp);

describe('GET appointments', () => {
  describe('GET /appointments doc as patient01', () => {
    it('should return appointments on data field', async () => {
      const res = await chai.request(server)
        .get('/events/appointments')
        .query({ _id: p01appointment01Id })
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'appointment doc', {
        data: {
          _id: p01appointment01Id,
        },
        dataKeys: ['_id', 'company', 'patient', 'specialization',
          'recipient', 'beginOfAppointment', 'office',
          'endOfAppointment', 'specialist', 'appointmentServices', 'class_name'],
      });
      res.body.data.appointmentServices.should.all.have.property('analyzesAndServices');
      res.body.data.appointmentServices.should.all.have.property('price');
      res.body.data.appointmentServices.should.all.have.property('summ');
      res.body.data.appointmentServices.should.all.have.property('summDiscount');
      res.body.data.appointmentServices.should.all.have.property('percentDiscount');
      res.body.data.appointmentServices[0].analyzesAndServices.should.have.property('presentation', 'Услуга хирурга номер один');
    });
  });
  describe('GET /appointments list as patient01', () => {
    it('should return array of appointments on data.docs field', async () => {
      const res = await chai.request(server)
        .get('/events/appointments')
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'appointments list', { dataKeys: ['docs', 'bookmark'] });
      res.body.data.docs.should.all.have.property('_id');
      res.body.data.docs.should.all.have.property('company');
      res.body.data.docs.should.all.have.property('patient');
      res.body.data.docs.should.all.have.property('specialization');
      res.body.data.docs.should.all.have.property('recipient');
      res.body.data.docs.should.all.have.property('beginOfAppointment');
      res.body.data.docs.should.all.have.property('endOfAppointment');
      res.body.data.docs.should.all.have.property('specialist');
      res.body.data.docs.should.all.have.property('appointmentServices');
      res.body.data.docs.should.all.have.property('class_name');
      res.body.data.docs[0].should.have.property('beginOfAppointment', '2019-04-03T10:20:00');
    });
    it('should return array of appointments on data.docs field starts 2019-04-01 end 2019-05-01', async () => {
      const res = await chai.request(server)
        .get('/events/appointments')
        .query({
          beginOfAppointmentDateGTE: '2019-04-01',
          beginOfAppointmentDateLT: '2019-05-01',
        })
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'appointments list', { dataKeys: ['docs', 'bookmark'] });
      res.body.data.docs.should.all.have.property('_id');
      res.body.data.docs.should.all.have.property('company');
      res.body.data.docs.should.all.have.property('patient');
      res.body.data.docs.should.all.have.property('specialization');
      res.body.data.docs.should.all.have.property('recipient');
      res.body.data.docs.should.all.have.property('beginOfAppointment');
      res.body.data.docs.should.all.have.property('endOfAppointment');
      res.body.data.docs.should.all.have.property('specialist');
      res.body.data.docs.should.all.have.property('appointmentServices');
      res.body.data.docs.should.all.have.property('class_name');
      res.body.data.docs.should.have.lengthOf(3);
      res.body.data.docs[0].should.have.property('beginOfAppointment', '2019-04-03T10:20:00');
    });
    it('should return array of appointments on data.docs field when JSON date format', async () => {
      const res = await chai.request(server)
        .get('/events/appointments')
        .query({
          beginOfAppointmentDateGTE: '2019-04-10T23:59:59.000Z',
          beginOfAppointmentDateLT: '2019-05-01T00:00:00.000Z',
        })
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'appointments list', { dataKeys: ['docs', 'bookmark'] });
      res.body.data.docs.should.all.have.property('_id');
      res.body.data.docs.should.all.have.property('company');
      res.body.data.docs.should.all.have.property('patient');
      res.body.data.docs.should.all.have.property('specialization');
      res.body.data.docs.should.all.have.property('recipient');
      res.body.data.docs.should.all.have.property('beginOfAppointment');
      res.body.data.docs.should.all.have.property('endOfAppointment');
      res.body.data.docs.should.all.have.property('specialist');
      res.body.data.docs.should.all.have.property('appointmentServices');
      res.body.data.docs.should.all.have.property('class_name');
      res.body.data.docs.should.have.lengthOf(2);
      res.body.data.docs[0].should.have.property('beginOfAppointment', '2019-04-10T09:10:00');
    });
  });
});
