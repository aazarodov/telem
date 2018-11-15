'use strict';

const log = require('logger-file-fun-line');
const couch = require('../connection');
const smsSchema = require('../../schemas/db/sms');
const unixtimestamp = require('../../utils/unixtimestamp');

const prefix = process.env.NODE_ENV === 'test' ? 'test' : 'telem';
const dbname = `${prefix}_sms`;
const smsdb = couch.use(dbname);

const removeExpiredSmsCode = async () => {
  const response = await smsdb.find({ selector: { expiry: { $lte: unixtimestamp() } } });
  const bulkDocs = {
    docs: [],
  };
  if (response.docs.length > 0) {
    // eslint-disable-next-line no-underscore-dangle
    response.docs.forEach((doc) => { bulkDocs.docs.push({ ...doc, _deleted: true }); });
    await smsdb.bulk(bulkDocs);
  }
  return response.docs.length;
};

module.exports = {
  async testSmsCode(smsToken, smsCode) {
    const response = await smsdb.find({ selector: { smsToken } });
    if (response.docs.length > 1) throw new Error(`More then one smsToken: ${smsToken}`);
    if (response.docs.length !== 1) return false;
    const doc = response.docs[0];
    if (Number(doc.expiry) <= unixtimestamp()) return false;
    if (doc.smsCode !== smsCode) return false;
    removeExpiredSmsCode(); // without await
    return true;
  },
  async testMobileNumber(mobileNumber) {
    const response = await smsdb.find({ selector: { mobileNumber } });
    if (response.docs.length > 1) throw new Error(`More then one mobileNumber: ${mobileNumber}`);
    if (response.docs.length !== 1) return 0;
    const doc = response.docs[0];
    if (Number(doc.expiry) <= unixtimestamp()) {
      await smsdb.destroy(doc._id, doc._rev); // eslint-disable-line no-underscore-dangle
      return 0;
    }
    return Number(doc.expiry);
  },
  async addSmsCode(newSmsRecord) {
    await smsSchema.validate(newSmsRecord);
    return smsdb.insert(newSmsRecord);
  },
};
