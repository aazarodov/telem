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
  p02SupportChat01Id,
  p01SupportChat02Id,
  p01SupportChat03Id,
  patient01Id,
  doctor05Id,
} = require('./things/values');


chai.should();
chai.use(chaiThings);
chai.use(chaiHttp);

describe('GET supportChats', () => {
  describe('GET /support/chats list as doctor05', () => {
    it('should return array of supportChats on data.docs field', async () => {
      const res = await chai.request(server)
        .get('/support/chats')
        .set('host', 'doctor.telmed.ml')
        .query({
          titles: ['Запись на прием', 'Медицинские услуги'],
          new: true,
          closed: false,
        })
        .set('Cookie', `dat=${doctor05Cookie}`);
      test(res, 'supportChats list', { dataKeys: ['docs', 'bookmark'] });
      res.body.data.docs.should.all.have.property('_id');
      res.body.data.docs.should.all.have.property('pid');
      res.body.data.docs.should.all.have.property('did', '');
      res.body.data.docs.should.all.have.property('title');
      res.body.data.docs.should.all.have.property('openDate');
      res.body.data.docs.should.all.have.property('closeDate', '');
    });
    it('should return array of supportChats on data.docs field', async () => {
      const res = await chai.request(server)
        .get('/support/chats')
        .set('host', 'doctor.telmed.ml')
        .query({
          titles: ['Запись на прием', 'Медицинские услуги'],
          new: false,
          closed: true,
        })
        .set('Cookie', `dat=${doctor05Cookie}`);
      test(res, 'supportChats list', { dataKeys: ['docs', 'bookmark'] });
      res.body.data.docs.should.all.have.property('_id');
      res.body.data.docs.should.all.have.property('pid');
      res.body.data.docs.should.all.have.property('did', doctor05Id);
      res.body.data.docs.should.all.have.property('title');
      res.body.data.docs.should.all.have.property('openDate');
      res.body.data.docs.should.all.have.property('closeDate');
    });
  });
  describe('GET /support/chats doc as doctor05', () => {
    it('should return supportChat on data field', async () => {
      const res = await chai.request(server)
        .get('/support/chats')
        .set('host', 'doctor.telmed.ml')
        .query({ _id: p01SupportChat02Id })
        .set('Cookie', `dat=${doctor05Cookie}`);
      test(res, 'supportChat doc', {
        data: {
          _id: p01SupportChat02Id,
          pid: patient01Id,
          did: doctor05Id,
          title: 'Медицинские услуги',
          openDate: '2019-03-05T04:22:06.002Z',
          // closeDate: '',
        },
        dataKeys: ['meta'],
      });
    });
  });
  describe('PUT /support/chats as doctor05', () => {
    it('should return supportChat taken', async () => {
      {
        const res = await chai.request(server)
          .put('/support/chats')
          .set('host', 'doctor.telmed.ml')
          .set('Cookie', `dat=${doctor05Cookie}`)
          .send({
            _id: p02SupportChat01Id,
          });
        test(res, 'supportChat taken');
      }
      const res = await chai.request(server)
        .get('/support/chats')
        .set('host', 'doctor.telmed.ml')
        .query({ _id: p02SupportChat01Id })
        .set('Cookie', `dat=${doctor05Cookie}`);
      test(res, 'supportChat doc', {
        data: {
          _id: p02SupportChat01Id,
          did: doctor05Id,
        },
      });
    });
    it('should return error 400 already taken', async () => {
      const res = await chai.request(server)
        .put('/support/chats')
        .set('host', 'doctor.telmed.ml')
        .set('Cookie', `dat=${doctor05Cookie}`)
        .send({
          _id: p02SupportChat01Id,
        });
      test(res, 400, 'supportChat already taken');
    });
    it('should return error 400 already closed', async () => {
      const res = await chai.request(server)
        .put('/support/chats')
        .set('host', 'doctor.telmed.ml')
        .set('Cookie', `dat=${doctor05Cookie}`)
        .send({
          _id: p01SupportChat02Id,
        });
      test(res, 400, 'supportChat already closed');
    });
  });
});
