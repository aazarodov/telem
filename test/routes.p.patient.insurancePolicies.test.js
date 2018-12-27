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

describe('GET insurancePolicies', () => {
  describe('GET /patient/insurancePolicies as patient01', () => {
    it('should return array of insurancePolicies on data.docs field', async () => {
      const res = await chai.request(server)
        .get('/patient/insurancePolicies')
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'insurancePolicies list', { dataKeys: ['docs', 'bookmark'] });
      res.body.data.docs.should.all.have.property('name');
      res.body.data.docs.should.all.have.property('dateOfStartInsurance');
      res.body.data.docs.should.all.have.property('dateofEndInsurance');
      res.body.data.docs.should.all.have.property('noActive');
      res.body.data.docs.should.all.have.nested.property('insuranceCompany.presentation');
      res.body.data.docs.should.all.have.nested.property('kindOfInsurance.presentation');
    });
  });
});
