'use strict';

const log = require('logger-file-fun-line');
const couch = require('../connection');
const { smsExpiry } = require('../../../../secrets');
const smsSchema = require('../../schemas/db/sms');
const unixtimestamp = require('../../utils/unixtimestamp');
const getSmsToken = require('../../utils/smsToken');


const dbname = 'test_sms';
const now = unixtimestamp();
const testExpiry = now + smsExpiry;

async function smsSeeding() {
  const smsSeeds = [
    {
      smsToken: await getSmsToken('78905671243', testExpiry),
      mobileNumber: '78905671243',
      smsCode: '3456',
      expiry: testExpiry,
    },
    {
      smsToken: await getSmsToken('98456342334', testExpiry),
      mobileNumber: '98456342334',
      smsCode: '0011',
      expiry: testExpiry,
    },
    {
      smsToken: await getSmsToken('86475287583', now - 1),
      mobileNumber: '86475287583',
      smsCode: '4545',
      expiry: now - 1,
    },
  ];
  try {
    await couch.db.destroy(dbname);
  } catch (error) {
    log(`${dbname} does not exist`);
  }
  await couch.db.create(dbname);
  const validatePromises = smsSeeds.map(seed => smsSchema.validate(seed));
  await Promise.all(validatePromises);
  const smsdb = couch.use(dbname);
  await smsdb.createIndex({
    index: { fields: ['smsToken'] },
    name: 'smsToken_index',
  });
  const insertPromises = smsSeeds.map(smsdb.insert);
  await Promise.all(insertPromises);
  log('sms seeded');
  return smsSeeds;
}
module.exports = smsSeeding;
