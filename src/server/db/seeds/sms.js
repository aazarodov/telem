'use strict';

process.env.NODE_ENV = 'test';

const log = require('logger-file-fun-line');
const couch = require('../connection');
const { smsExpiry } = require('../../../../secrets');
const smsSchema = require('../../schemas/db/sms');
const unixtimestamp = require('../../utils/unixtimestamp');


const dbname = 'test_sms';
const now = unixtimestamp();
const testExpiry = now + smsExpiry;

const smsSeeding = async () => {
  const smsSeeds = [
    {
      _id: '78905671243',
      expiry: testExpiry,
    },
    {
      _id: '78456342334',
      expiry: testExpiry,
    },
    {
      _id: '76475287583',
      expiry: now - 1,
    },
    {
      _id: '70000000001',
      expiry: 1,
    },
  ];
  try {
    const validatePromises = smsSeeds.map(seed => smsSchema.validate(seed, { convert: false }));
    await Promise.all(validatePromises);
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
      name: 'expiry_index',
    });
    const insertPromises = smsSeeds.map(smsdb.insert);
    await Promise.all(insertPromises);
    log(`${dbname} successfully seeded`);
  } catch (error) {
    log(`${dbname} seeding error`, error);
  }
  return smsSeeds;
};
module.exports = smsSeeding;
