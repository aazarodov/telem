
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

describe('GET unread messages', () => {
  describe('GET /notifications/unread as patient01', () => {
    it('should return array of messages', async () => {
      const res = await chai.request(server)
        .get('/notifications/unread')
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'unread messages list', { dataKeys: ['docs', 'bookmark'] });
      res.body.data.docs.should.all.have.property('_id');
      res.body.data.docs.should.all.have.property('chatId');
      res.body.data.docs.should.all.have.property('sendDate');
      res.body.data.docs.should.all.have.property('receivedDate');
      res.body.data.docs.should.all.have.property('deliveredDate');
      res.body.data.docs.should.all.have.property('readDate');
      res.body.data.docs.should.all.have.property('meta');
      res.body.data.docs.should.all.have.property('text');
    });
  });
});
