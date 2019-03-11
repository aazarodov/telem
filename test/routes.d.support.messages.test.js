'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiThings = require('chai-things');
const log = require('logger-file-fun-line');
const test = require('./things/test')();
const {
  server,
  doctor05Cookie,
  p01SupportChat01Id,
  p01SupportChat02Id,
  p01SupportChat03Id,
  supportTitle01Id,
} = require('./things/values');


chai.should();
chai.use(chaiThings);
chai.use(chaiHttp);

describe('GET supportMessages', () => {
  describe('GET /support/messages list as doctor05', () => {
    it('should return array of supportMessages for new chat', async () => {
      const res = await chai.request(server)
        .get('/support/messages')
        .set('host', 'doctor.telmed.ml')
        .query({ chatId: p01SupportChat01Id })
        .set('Cookie', `dat=${doctor05Cookie}`);
      test(res, 'supportMessages list', { dataKeys: ['docs', 'bookmark'] });
      res.body.data.docs.should.all.have.property('_id');
      res.body.data.docs.should.all.have.property('chatId');
      res.body.data.docs.should.all.have.property('from');
      res.body.data.docs.should.all.have.property('to');
      res.body.data.docs.should.all.have.property('sendDate');
      res.body.data.docs.should.all.have.property('receivedDate');
      res.body.data.docs.should.all.have.property('deliveredDate');
      res.body.data.docs.should.all.have.property('readDate');
      res.body.data.docs.should.all.have.property('meta');
      res.body.data.docs.should.all.have.property('text');
    });
    it('should return array of supportMessages for self taken chat', async () => {
      const res = await chai.request(server)
        .get('/support/messages')
        .set('host', 'doctor.telmed.ml')
        .query({ chatId: p01SupportChat02Id })
        .set('Cookie', `dat=${doctor05Cookie}`);
      test(res, 'supportMessages list', { dataKeys: ['docs', 'bookmark'] });
      res.body.data.docs.should.all.have.property('_id');
      res.body.data.docs.should.all.have.property('chatId');
      res.body.data.docs.should.all.have.property('from');
      res.body.data.docs.should.all.have.property('to');
      res.body.data.docs.should.all.have.property('sendDate');
      res.body.data.docs.should.all.have.property('receivedDate');
      res.body.data.docs.should.all.have.property('deliveredDate');
      res.body.data.docs.should.all.have.property('readDate');
      res.body.data.docs.should.all.have.property('meta');
      res.body.data.docs.should.all.have.property('text');
    });
    it('should return array of supportMessages for other taken chat', async () => {
      const res = await chai.request(server)
        .get('/support/messages')
        .set('host', 'doctor.telmed.ml')
        .query({ chatId: p01SupportChat03Id })
        .set('Cookie', `dat=${doctor05Cookie}`);
      test(res, 'supportMessages list', { dataKeys: ['docs', 'bookmark'] });
      res.body.data.docs.should.all.have.property('_id');
      res.body.data.docs.should.all.have.property('chatId');
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
        .set('host', 'doctor.telmed.ml')
        .query({ chatId: supportTitle01Id })
        .set('Cookie', `dat=${doctor05Cookie}`);
      test(res, 404, 'supportChat not found');
    });
  });
});
