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
  p01laboratoryAnalyzesId,
} = require('./things/values');

chai.should();
chai.use(chaiThings);
chai.use(chaiHttp);

describe('GET statusesOfAnalysis', () => {
  describe('GET /statusesOfAnalysis as patient01', () => {
    it('should return associative array of status&result', async () => {
      const res = await chai.request(server)
        .get(`/statusesOfAnalysis?_id=${p01laboratoryAnalyzesId}`)
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'statusesOfAnalysis list');
      res.body.data['032403a0-5e32-4b7d-814f-388103bfdaa5'].should.have.property('status', 'Готов');
      res.body.data['032403a0-5e32-4b7d-814f-388103bfdaa5'].should.have.property('period', '2018-12-26T16:47:04');
      res.body.data['032403a0-5e32-4b7d-814f-388103bfdaa5'].should.have.property('result', 30);
      res.body.data['f3bb08ce-5f99-4250-94b6-311e61a2cfb2'].should.have.property('status', 'ОжиданиеКонтроля');
      res.body.data['f3bb08ce-5f99-4250-94b6-311e61a2cfb2'].should.have.property('period', '2018-12-26T16:47:56');
      res.body.data['f3bb08ce-5f99-4250-94b6-311e61a2cfb2'].should.not.have.property('result');
    });
  });
});
