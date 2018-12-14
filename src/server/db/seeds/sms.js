'use strict';

process.env.NODE_ENV = 'test';

const log = require('logger-file-fun-line');
const couch = require('../connection');
const { smsExpiry } = require('../../../../secrets');
const smsSchema = require('../../schemas/db/sms/sms');
const unixtimestamp = require('../../utils/unixtimestamp');
const {
  phoneNumber01,
  phoneNumber02,
  phoneNumber03Expired,
  phoneNumber04Expired,
} = require('../../../../test/things/values');


const dbname = 'test_sms';
const now = unixtimestamp();
const expiry = now + smsExpiry;

const smsSeeding = async () => {
  let smsSeeds = [
    {
      _id: phoneNumber01,
      expiry,
    },
    {
      _id: phoneNumber02,
      expiry,
    },
    {
      _id: phoneNumber03Expired,
      expiry: now - 1,
    },
    {
      _id: phoneNumber04Expired,
      expiry: 1,
    },
  ];
  try {
    const validatePromises = smsSeeds.map(seed => smsSchema.validate(seed));
    smsSeeds = await Promise.all(validatePromises);
  } catch (error) {
    log('validate smsSeeds error', error);
    return null;
  }
  try {
    await couch.db.destroy(dbname);
  } catch (error) {
    log(`${dbname} does not exist`);
  }
  try {
    await couch.db.create(dbname);
    const smsdb = couch.use(dbname);
    await smsdb.createIndex({
      index: { fields: ['expiry'] },
      ddoc: 'indexes',
      name: 'expiry',
    });
    const insertPromises = smsSeeds.map(smsdb.insert);
    await Promise.all(insertPromises);
    log(`${dbname} successfully seeded`);
  } catch (error) {
    log(`${dbname} seeding error`, error);
  }
  return smsSeeds;
};

if (require.main === module) smsSeeding();

module.exports = smsSeeding;
