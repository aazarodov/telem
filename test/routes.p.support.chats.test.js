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
  p01SupportChat04Id,
  p02SupportChat01Id,
  patient02Id,
  patient01Id,
  doctor05Id,
} = require('./things/values');


chai.should();
chai.use(chaiThings);
chai.use(chaiHttp);

describe('GET supportChats', () => {
  describe('GET /support/chats list as patient01', () => {
    it('should return array of opened supportChats on data.docs field', async () => {
      const res = await chai.request(server)
        .get('/support/chats')
        .query({ closed: false })
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'supportChats list', { dataKeys: ['docs', 'bookmark'] });
      res.body.data.docs.should.all.have.property('_id');
      res.body.data.docs.should.all.have.property('pid');
      res.body.data.docs.should.all.have.property('did');
      res.body.data.docs.should.all.have.property('title');
      res.body.data.docs.should.all.have.property('openDate');
      res.body.data.docs.should.all.have.property('closeDate', '');
    });
    it('should return array of closed supportChats on data.docs field', async () => {
      const res = await chai.request(server)
        .get('/support/chats')
        .query({ closed: true })
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'supportChats list', { dataKeys: ['docs', 'bookmark'] });
      res.body.data.docs.should.all.have.property('_id');
      res.body.data.docs.should.all.have.property('pid');
      res.body.data.docs.should.all.have.property('did');
      res.body.data.docs.should.all.have.property('title');
      res.body.data.docs.should.all.have.property('openDate');
      res.body.data.docs.should.all.have.property('closeDate');
      res.body.data.docs.should.all.not.have.property('closeDate', '');
    });
  });
  describe('GET /support/chats doc as patient01', () => {
    it('should return supportChat on data field', async () => {
      const res = await chai.request(server)
        .get('/support/chats')
        .query({ _id: p01SupportChat01Id })
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'supportChat doc', {
        data: {
          _id: p01SupportChat01Id,
          pid: patient01Id,
          did: '',
          title: 'Запись на прием',
          openDate: '2019-03-06T11:22:06.001Z',
          closeDate: '',
        },
      });
    });
  });
  describe('GET /support/chats doc as patient01 with unread messages', () => {
    it('should return supportChat on data field', async () => {
      const res = await chai.request(server)
        .get('/support/chats')
        .query({ _id: p01SupportChat04Id })
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'supportChat doc', {
        data: {
          _id: p01SupportChat04Id,
          pid: patient01Id,
          did: doctor05Id,
          title: 'Медицинские услуги',
          openDate: '2019-01-01T01:01:01.000Z',
          closeDate: '2019-01-01T02:02:02.000Z',
          unread: 2,
        },
      });
    });
  });
  describe('GET supportChat doc patient02 as patient01', () => {
    it('should return not found error', async () => {
      const res = await chai.request(server)
        .get('/support/chats')
        .query({ _id: p02SupportChat01Id })
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 404, 'supportChat not found');
    });
  });
  describe('GET supportChat doc patient02 as patient01 with family accesss', () => {
    it('should return supportChat patient02 on data field', async () => {
      const res = await chai.request(server)
        .get('/support/chats')
        .query({ _id: p02SupportChat01Id, pid: patient02Id })
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'supportChat doc', {
        data: {
          _id: p02SupportChat01Id,
          title: 'Запись на прием',
          openDate: '2019-01-20T15:15:15.000Z',
          closeDate: '',
        },
      });
    });
  });
});
