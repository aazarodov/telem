'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiThings = require('chai-things');
const log = require('logger-file-fun-line');
const path = require('path');
const fs = require('fs');
const test = require('./things/test')();
const {
  server,
  patient01Cookie,
  p01File01Id,
  p02File01Id,
  notExistId,
} = require('./things/values');


const should = chai.should();
chai.use(chaiThings);
chai.use(chaiHttp);

const fileName = path.join(__dirname, 'things', '1.png');

let createdFileId;

describe('PUT/GET/POST/DELETE files', () => {
  describe('PUT /files as patient01', () => {
    it('should return _id', async () => {
      const ostream = fs.createReadStream(fileName);
      const req = chai.request(server)
        .put('/files')
        .query({ name: '1px.png', comment: 'This is png file' })
        .set('Cookie', `pat=${patient01Cookie}`)
        .set('Content-Type', 'image/png')
        .set('Content-Length', fs.statSync(fileName).size);
      const res = await new Promise((resolve, reject) => {
        ostream.pipe(req)
          .on('response', response => resolve(response))
          .on('error', error => reject(error));
      });
      test(res, 201, 'file uploaded', { dataKeys: ['_id'] });
      createdFileId = res.body.data._id;
    });
    it('should return 423 when file count limit', async () => {
      const res = await chai.request(server)
        .put('/files')
        .query({ name: '1px.png', comment: 'This is png file' })
        .set('Cookie', `pat=${patient01Cookie}`)
        .set('Content-Type', 'image/png')
        .set('Content-Length', 82);
      test(res, 400, 'files limit reached');
    });
    it('should return 415 when multipart/* Content-Type', async () => {
      const res = await chai.request(server)
        .put('/files')
        .query({ name: '1px.png', comment: 'This is png file' })
        .set('Cookie', `pat=${patient01Cookie}`)
        .set('Content-Type', 'multipart/form-data')
        .set('Content-Length', 82);
      test(res, 415, 'multipart unsupported');
    });
    it('should return 415 when Content-Type omitted', async () => {
      const res = await chai.request(server)
        .put('/files')
        .query({ name: '1px.png', comment: 'This is png file' })
        .set('Cookie', `pat=${patient01Cookie}`)
        .set('Content-Length', 82);
      test(res, 415, 'Content-Type required');
    });
    it('should return 411 when Content-Length omitted', async () => {
      const res = await chai.request(server)
        .put('/files')
        .query({ name: '1px.png', comment: 'This is png file' })
        .set('Cookie', `pat=${patient01Cookie}`)
        .set('Content-Type', 'image/png');
      test(res, 411, 'Content-Length required');
    });
    it('should return 413 when Content-Length too large', async () => {
      const res = await chai.request(server)
        .put('/files')
        .query({ name: '1px.png', comment: 'This is png file' })
        .set('Cookie', `pat=${patient01Cookie}`)
        .set('Content-Type', 'image/png')
        .set('Content-Length', 1073741824);
      test(res, 413, 'Content-Length too large');
    });
  });
  describe('GET /files list as patient01', () => {
    it('should return list of files', async () => {
      const res = await chai.request(server)
        .get('/files')
        .query({ limit: 2 })
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'file list', { dataKeys: ['docs', 'bookmark'] });
      res.body.data.docs.length.should.eql(2);
      res.body.data.docs.should.all.have.property('_id');
      res.body.data.docs.should.all.have.property('name');
      res.body.data.docs.should.all.have.property('comment');
      res.body.data.docs.should.all.have.property('date');
      res.body.data.docs.should.all.have.property('type');
      res.body.data.docs.should.all.have.property('length');
    });
  });
  describe('GET /files png as patient01', () => {
    it('should return png file', async () => {
      const res = await chai.request(server)
        .get('/files')
        .query({ _id: createdFileId })
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, { type: 'image/png', bodyTest: false });
      res.should.have.header('content-length', '82');
      res.should.have.header('content-md5', 'U5CPs/GWg2c9j9Zcn6BTlg==');
      res.body.should.to.be.instanceof(Buffer);
      res.body.length.should.eql(82);
    });
    it('should return 404 error when not own', async () => {
      const res = await chai.request(server)
        .get('/files')
        .query({ _id: p02File01Id })
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 404, 'file not found');
    });
    it('should return 404 error when not exist', async () => {
      try {
        const res = await chai.request(server)
          .get('/files')
          .query({ _id: notExistId })
          .set('Cookie', `pat=${patient01Cookie}`);
        test(res, 404, 'file not found');
      } catch (error) {
        should.fail(error);
      }
    });
  });
  describe('POST /files name and comment as patient01', () => {
    it('should successfully change comment', async () => {
      const res = await chai.request(server)
        .post('/files')
        .set('Cookie', `pat=${patient01Cookie}`)
        .send({
          _id: p01File01Id,
          comment: 'New_comment',
        });
      test(res, 'file updated');
      res.body.data.should.have.property('_id');
      res.body.data.should.have.property('name');
      res.body.data.should.have.property('comment', 'New_comment');
      res.body.data.should.have.property('date');
      res.body.data.should.have.property('type');
      res.body.data.should.have.property('length');
    });
    it('should return 400 validate error when not name or comment', async () => {
      const res = await chai.request(server)
        .post('/files')
        .set('Cookie', `pat=${patient01Cookie}`)
        .send({
          _id: p01File01Id,
        });
      test(res, 400, 'validate error');
    });
    it('should return 404 error when not own', async () => {
      const res = await chai.request(server)
        .post('/files')
        .set('Cookie', `pat=${patient01Cookie}`)
        .send({
          _id: p02File01Id,
          comment: 'New_comment',
        });
      test(res, 404, 'file not found');
    });
    it('should return 404 error when not exist', async () => {
      const res = await chai.request(server)
        .post('/files')
        .set('Cookie', `pat=${patient01Cookie}`)
        .send({
          _id: notExistId,
          name: 'New_name',
        });
      test(res, 404, 'file not found');
    });
  });
  describe('DELETE /files name and comment as patient01', () => {
    it('should delete file p01File01Id', async () => {
      const res = await chai.request(server)
        .del('/files')
        .set('Cookie', `pat=${patient01Cookie}`)
        .send({
          _id: p01File01Id,
        });
      test(res, 'file deleted');
    });
    it('should return 404 when already deleted', async () => {
      const res = await chai.request(server)
        .del('/files')
        .set('Cookie', `pat=${patient01Cookie}`)
        .send({
          _id: p01File01Id,
        });
      test(res, 404, 'file not found');
    });
    it('should return 404 error when not own', async () => {
      const res = await chai.request(server)
        .del('/files')
        .set('Cookie', `pat=${patient01Cookie}`)
        .send({
          _id: p02File01Id,
        });
      test(res, 404, 'file not found');
    });
    it('should return 404 error when not exist', async () => {
      const res = await chai.request(server)
        .del('/files')
        .set('Cookie', `pat=${patient01Cookie}`)
        .send({
          _id: notExistId,
        });
      test(res, 404, 'file not found');
    });
  });
});
