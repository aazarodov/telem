'use strict';

const log = require('logger-file-fun-line');
const couch = require('../connection');
const { smsExpiry } = require('../../../../secrets');
const smsSchema = require('../../schemas/db/sms');
const unixtimestamp = require('../../utils/unixtimestamp');
const token = require('../../utils/token');


const dbname = 'test_sms';
const now = unixtimestamp();
const testExpiry = now + smsExpiry;

async function smsSeeding() {
  const smsSeedsRaw = [
    {
      mobileNumber: '78905671243',
      smsCode: '3456',
      expiry: testExpiry,
    },
    {
      mobileNumber: '98456342334',
      smsCode: '0011',
      expiry: testExpiry,
    },
    {
      mobileNumber: '86475287583',
      smsCode: '4545',
      expiry: now - 1,
    },
  ];
  const smsSeeds = [
    {
      ...smsSeedsRaw[0],
      smsToken: await token.encrypt(smsSeedsRaw[0]),
    },
    {
      ...smsSeedsRaw[1],
      smsToken: await token.encrypt(smsSeedsRaw[1]),
    },
    {
      ...smsSeedsRaw[2],
      smsToken: await token.encrypt(smsSeedsRaw[2]),
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
