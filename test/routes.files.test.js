'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiThings = require('chai-things');
const log = require('logger-file-fun-line');
const path = require('path');
const fs = require('fs');
const server = require('../src/server/app');
const filesSeeding = require('../src/server/db/seeds/files');
const { patient01Cookie, p02FileId, notExistId } = require('./things/values');
const { test } = require('./things/utils');

const should = chai.should();
chai.use(chaiThings);
chai.use(chaiHttp);

before(async () => {
  try {
    await filesSeeding();
  } catch (error) {
    log(error);
  }
});

const fileName = path.join(__dirname, 'things', '1.png');

let createdFileId;

describe('PUT/POST/GET/DELETE files', () => {
  describe('PUT /files as Пушкин', () => {
    it('should return _id _rev', async () => {
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
      test(res, 201, 'file uploaded', { dataKeys: ['_id', '_rev'] });
      createdFileId = res.body.data._id;
    });
    it('should return 423 when file count limit', async () => {
      const res = await chai.request(server)
        .put('/files')
        .query({ name: '1px.png', comment: 'This is png file' })
        .set('Cookie', `pat=${patient01Cookie}`)
        .set('Content-Type', 'image/png')
        .set('Content-Length', 82);
      test(res, 423, 'files limit reached');
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
  describe('GET /files list as Пушкин', () => {
    it('should return list of files', async () => {
      const res = await chai.request(server)
        .get('/files')
        .query({ limit: 2 })
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'file list', { dataKeys: ['docs', 'bookmark'] });
      res.body.data.docs.length.should.eql(2);
      res.body.data.docs.should.all.have.property('_id');
      res.body.data.docs.should.all.have.property('_rev');
      res.body.data.docs.should.all.have.property('name');
      res.body.data.docs.should.all.have.property('comment');
      res.body.data.docs.should.all.have.property('length');
      res.body.data.docs.should.all.have.property('type');
    });
  });
  describe('GET /files png as Пушкин', () => {
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
        .query({ _id: p02FileId })
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
});
