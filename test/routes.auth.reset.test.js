'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const log = require('logger-file-fun-line');
const server = require('../src/server/app');
// const ramSeeding = require('../src/server/db/seeds/hw_0_ram');

chai.should();
chai.use(chaiHttp);

// before(async () => ramSeeding());

describe('POST auth/reset', () => {
  describe('reset password', () => {
    it('should reset password when "Активен" status', async () => {
      const res = await chai.request(server)
        .post('/auth/reset')
        .send({
          password: 'nMnd9t3thg3hnifne', // mobileNumber: '79876543210',
          registerToken: 'OItCwkoq3j7ROvkzRgT25LF30jewUB6Iv1bNsq00Mw/5LMkG6JvuR2u2opRqcxWviW8FDnb6iSNstMMEkhcQcqn0FglkwtYT2MP/C4fzrZw=',
        });
      res.status.should.equal(200);
      res.type.should.equal('application/json');
      res.body.status.should.eql('success');
      res.body.message.should.eql('reset password successful');
    });
    it('should login with new password', async () => {
      const res = await chai.request(server)
        .post('/auth/login')
        .send({
          login: '79876543210',
          password: 'nMnd9t3thg3hnifne',
        });
      res.status.should.equal(200);
      res.type.should.equal('application/json');
      res.body.status.should.eql('success');
      res.body.message.should.eql('login successful');
      res.should.have.cookie('pat');
      res.body.data.patient.firstName.should.eql('Александр');
    });
    it('should reset password back', async () => {
      const res = await chai.request(server)
        .post('/auth/reset')
        .send({
          password: '1234567', // mobileNumber: '79876543210',
          registerToken: 'OItCwkoq3j7ROvkzRgT25LF30jewUB6Iv1bNsq00Mw/5LMkG6JvuR2u2opRqcxWviW8FDnb6iSNstMMEkhcQcqn0FglkwtYT2MP/C4fzrZw=',
        });
      res.status.should.equal(200);
      res.type.should.equal('application/json');
      res.body.status.should.eql('success');
      res.body.message.should.eql('reset password successful');
    });
    it('should login with old password', async () => {
      const res = await chai.request(server)
        .post('/auth/login')
        .send({
          login: '79876543210',
          password: '1234567',
        });
      res.status.should.equal(200);
      res.type.should.equal('application/json');
      res.body.status.should.eql('success');
      res.body.message.should.eql('login successful');
      res.should.have.cookie('pat');
      res.body.data.patient.firstName.should.eql('Александр');
    });
    it('should trow error when "Не активирован" status', async () => {
      const res = await chai.request(server)
        .post('/auth/reset')
        .send({
          password: '123456guBIGBEiu',
          registerToken: 'JmY83YjuUCw8091eTq24BVWHlw/p8tEC8mXPnovLt4eAgLkhR24no7eQ+e2CbU6cuwP+zvttBP/dnIAt9PzA8J7yMBbQZJxUeiYVkN3eng4=',
        });
      res.status.should.equal(400);
      res.type.should.equal('application/json');
      res.body.status.should.eql('error');
      res.body.message.should.eql('patient not activeted');
    });
  });
});
