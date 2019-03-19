'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiThings = require('chai-things');
const log = require('logger-file-fun-line');
const test = require('./things/test')();
const {
  server,
  doctor01Cookie,
  doctor05Cookie,
  patient01Id,
  patient02Id,
} = require('./things/values');


chai.should();
chai.use(chaiThings);
chai.use(chaiHttp);

describe('GET patient info', () => {
  describe('GET /whois as doctor05 and doctor01', () => {
    it('should return patient01 info', async () => {
      const res = await chai.request(server)
        .get('/whois')
        .set('host', 'doctor.telmed.ml')
        .query({ patientId: patient01Id })
        .set('Cookie', `dat=${doctor05Cookie}`);
      test(res, 'patient info', {
        data: {
          _id: patient01Id,
          name: 'Пушкин Александр Сергеевич',
          lastName: 'Пушкин',
          firstName: 'Александр',
          middleName: 'Сергеевич',
          'sex.presentation': 'Мужской',
          birthDate: '1799-06-06T00:00:00',
          'groupOfBlood.presentation': 'A(II) Rh+',
          'groupOfHealthy.presentation': 'Основная',
          agreementOfSendingOtherInformation: true,
          agreementOfSendingResults: true,
        },
        dataKeys: ['contactInformation', 'note', 'status', 'meta'],
        dataNotKeys: ['_rev', 'password'],
      });
      res.body.data.meta.should.have.property('test', 'testString');
    });
    it('should return patient02 info', async () => {
      const res = await chai.request(server)
        .get('/whois')
        .set('host', 'doctor.telmed.ml')
        .query({ patientId: patient02Id })
        .set('Cookie', `dat=${doctor01Cookie}`);
      test(res, 'patient info', {
        data: {
          _id: patient02Id,
          name: 'Бродский Иосиф Александрович',
        },
        dataKeys: ['contactInformation', 'note', 'status'],
        dataNotKeys: ['_rev', 'password'],
      });
    });
  });
});
