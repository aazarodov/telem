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

describe('GET patient', () => {
  describe('GET /patient as patient01', () => {
    it('should return patient01', async () => {
      const res = await chai.request(server)
        .get('/patient')
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'patient info', {
        data: {
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
        dataKeys: ['contactInformation'],
        dataNotKeys: ['_id', '_rev', 'id', 'rev', 'password', 'note', 'status'],
      });
      // Тут вид контактной информации Телефон, Телефон представителя, E-mail, Адрес
      res.body.data.contactInformation.should.all.have.nested.property('kind.presentation');
      res.body.data.contactInformation.should.all.have.property('presentation'); // Тут адрес
      res.body.data.contactInformation.should.all.have.property('country'); // Тут пусто
      res.body.data.contactInformation.should.all.have.property('region'); // Тут пусто
      res.body.data.contactInformation.should.all.have.property('city'); // Тут пусто
      res.body.data.contactInformation.should.all.have.property('emailAddress'); // Тут emailAddress
      res.body.data.contactInformation.should.all.have.property('phoneNumber'); // Тут phoneNumber
      res.body.data.contactInformation.should.all.have.property('phoneNumberWithoutCodes'); // Тут пусто
    });
  });
});
