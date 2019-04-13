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
} = require('./things/values');


chai.should();
chai.use(chaiThings);
chai.use(chaiHttp);

describe('GET support/allChats', () => {
  describe('GET /support/allChats list as doctor05', () => {
    it('should return array of all open and taken supportChats on data.docs field', async () => {
      const res = await chai.request(server)
        .get('/support/allChats')
        .set('host', 'doctor.telmed.ml')
        .query({
          titles: ['Запись на прием', 'Медицинские услуги'],
          closed: false,
        })
        .set('Cookie', `dat=${doctor05Cookie}`);
      test(res, 'allSupportChats list', { dataKeys: ['docs', 'bookmark'] });
      res.body.data.docs.should.all.have.property('_id');
      res.body.data.docs.should.all.have.property('pid');
      res.body.data.docs.should.all.have.property('did');
      res.body.data.docs.should.all.not.have.property('did', '');
      res.body.data.docs.should.all.have.property('title');
      res.body.data.docs.should.all.have.property('openDate');
      res.body.data.docs.should.all.have.property('closeDate', '');
    });
    it('should return array of taken and closed supportChats on data.docs field', async () => {
      const res = await chai.request(server)
        .get('/support/allChats')
        .set('host', 'doctor.telmed.ml')
        .query({
          titles: ['Запись на прием', 'Медицинские услуги'],
          closed: true,
        })
        .set('Cookie', `dat=${doctor05Cookie}`);
      test(res, 'allSupportChats list', { dataKeys: ['docs', 'bookmark'] });
      res.body.data.docs.should.all.have.property('_id');
      res.body.data.docs.should.all.have.property('pid');
      res.body.data.docs.should.all.have.property('did');
      res.body.data.docs.should.all.not.have.property('did', '');
      res.body.data.docs.should.all.have.property('title');
      res.body.data.docs.should.all.have.property('openDate');
      res.body.data.docs.should.all.have.property('closeDate');
      res.body.data.docs.should.all.not.have.property('closeDate', '');
    });
  });
});
