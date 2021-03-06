'use strict';

const log = require('logger-file-fun-line');
const couch = require('../connection');
const smsSchema = require('../../schemas/db/sms/sms');
const unixtimestamp = require('../../utils/unixtimestamp');
const { smsExpiry } = require('../../../../secrets');
const prefix = require('../../utils/prefix');

const dbname = prefix('sms');
const smsdb = couch.use(dbname);

// indexes: expiry

let removeExpiredSmsDocsTimestamp = 0;

module.exports = {
  async existphoneNumber(phoneNumber) {
    try {
      const smsDoc = await smsdb.get(phoneNumber);
      if (smsDoc.expiry < unixtimestamp()) {
        await smsdb.destroy(smsDoc._id, smsDoc._rev);
        return false;
      }
      return true;
    } catch (error) {
      if (error.error === 'not_found') return false;
      throw error;
    }
  },
  async addSmsDoc(newSmsDoc) {
    await smsSchema.validate(newSmsDoc);
    await smsdb.insert(newSmsDoc);
  },
  async removeExpiredSmsDocs() {
    const now = unixtimestamp();
    if (removeExpiredSmsDocsTimestamp > unixtimestamp()) return;
    removeExpiredSmsDocsTimestamp = now + smsExpiry;
    try {
      const response = await smsdb.find({ selector: { expiry: { $lte: now } } });
      const bulkDocs = {
        docs: [],
      };
      if (response.docs.length > 0) {
        response.docs.forEach((doc) => { bulkDocs.docs.push({ ...doc, _deleted: true }); });
        await smsdb.bulk(bulkDocs);
      }
    } catch (error) {
      log('removeExpiredSmsDocs error', error);
    }
  },
};
