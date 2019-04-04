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

describe('POST /appointment/record2', () => {
  describe('POST /appointment/record2 as patient01', () => {
    it('should return appointment record2 created', async () => {
      const res = await chai.request(server)
        .post('/appointment/record2')
        .set('Cookie', `pat=${patient01Cookie}`)
        .send({
          patient: {
            ref: '00000000-0000-1000-8000-000000000001',
            presentation: 'Пушкин Александр Сергеевич',
          },
          service: {
            ref: '00000000-0000-1000-8000-000001000001',
            presentation: 'Услуга хирурга номер один',
          },
          specialist: {
            ref: '00000000-0000-1000-8000-000000000010',
            presentation: 'Валентин Феликсович Войно-Ясенецкий',
          },
          company: {
            ref: '9010f2d8-dab7-11de-b21b-00140b0496c2',
            presentation: 'МЦ Вита (Ленинградская 136)',
          },
          beginOfAppointment: '2019-06-10T09:20:00',
          endOfAppointment: '2019-06-10T09:30:00',
        });
      test(res, 'appointment record2 created');
    });
  });
});
