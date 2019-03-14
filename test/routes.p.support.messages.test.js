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
  p01SupportChat01Id,
  p02SupportChat01Id,
} = require('./things/values');


chai.should();
chai.use(chaiThings);
chai.use(chaiHttp);

describe('GET supportMessages', () => {
  describe('GET /support/messages list as patient01', () => {
    it('should return array of supportMessages on data.docs field', async () => {
      const res = await chai.request(server)
        .get('/support/messages')
        .query({ chatId: p01SupportChat01Id })
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'supportMessages list', { dataKeys: ['docs', 'bookmark'] });
      res.body.data.docs.should.all.have.property('_id');
      res.body.data.docs.should.all.have.property('chatId');
      res.body.data.docs.should.all.have.property('type');
      res.body.data.docs.should.all.have.property('from');
      res.body.data.docs.should.all.have.property('to');
      res.body.data.docs.should.all.have.property('sendDate');
      res.body.data.docs.should.all.have.property('receivedDate');
      res.body.data.docs.should.all.have.property('deliveredDate');
      res.body.data.docs.should.all.have.property('readDate');
      res.body.data.docs.should.all.have.property('meta');
      res.body.data.docs.should.all.have.property('text');
    });
    it('should return error 404 supportChat not found', async () => {
      const res = await chai.request(server)
        .get('/support/messages')
        .query({ chatId: p02SupportChat01Id })
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 404, 'supportChat not found');
    });
  });
});
