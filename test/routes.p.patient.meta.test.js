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

describe('POST meta', () => {
  describe('POST /patient/meta as patient01', () => {
    it('should update meta.avatarFileId successfully', async () => {
      let meta;
      {
        const res = await chai.request(server)
          .get('/patient')
          .set('Cookie', `pat=${patient01Cookie}`);
        test(res, 'patient info', { dataKeys: ['meta'] });
        res.body.data.meta.should.have.property('test', 'testString');
        ({ meta } = res.body.data);
      }
      meta.avatarFileId = '00000000-0000-1000-8000-000000000110';
      {
        const res = await chai.request(server)
          .post('/patient/meta')
          .set('Cookie', `pat=${patient01Cookie}`)
          .send({ meta });
        test(res, 'meta updated');
      }
      {
        const res = await chai.request(server)
          .get('/patient')
          .set('Cookie', `pat=${patient01Cookie}`);
        test(res, 'patient info', { dataKeys: ['meta'] });
        res.body.data.meta.should.have.property('test', 'testString');
        res.body.data.meta.should.have.property('avatarFileId', '00000000-0000-1000-8000-000000000110');
      }
    });
    it('should delete meta successfully', async () => {
      {
        const res = await chai.request(server)
          .post('/patient/meta')
          .set('Cookie', `pat=${patient01Cookie}`)
          .send({ meta: '' });
        test(res, 'meta updated');
      }
      {
        const res = await chai.request(server)
          .get('/patient')
          .set('Cookie', `pat=${patient01Cookie}`);
        test(res, 'patient info', { data: { meta: '' } });
      }
      {
        const res = await chai.request(server)
          .post('/patient/meta')
          .set('Cookie', `pat=${patient01Cookie}`)
          .send({ meta: { test: 'testString' } });
        test(res, 'meta updated');
      }
    });
  });
});
