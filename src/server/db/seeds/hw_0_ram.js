'use strict';

process.env.NODE_ENV = 'test';

const log = require('logger-file-fun-line');
const couch = require('../connection');
const patientStatuses = require('./hw_0_ram/patientStatuses');
const contactInformation = require('./hw_0_ram/contactInformation');
const patients = require('./hw_0_ram/patients');

const dbname = 'test_hw_0_ram';

const ramSeeding = async () => {
  try {
    await couch.db.destroy(dbname);
  } catch (error) {
    log(`${dbname} does not exist`);
  }
  await couch.db.create(dbname);
  const db = couch.use(dbname);
  await db.createIndex({
    index: { fields: ['class_name'] },
    name: 'class_name_index',
  });
  await db.createIndex({
    index: { fields: ['class_name', 'password'] },
    name: 'class_name_password_index',
  });
  try {
    let patientStatusSeeds = await patientStatuses();
    const insertPromises = patientStatusSeeds.map(db.insert);
    patientStatusSeeds = await Promise.all(insertPromises);
  } catch (error) {
    log(`${dbname} patientStatus seeding error`, error);
    return;
  }
  log(`${dbname} patientStatus successfully seeded`);

  try {
    let contactInformationSeeds = await contactInformation();
    const insertPromises = contactInformationSeeds.map(db.insert);
    contactInformationSeeds = await Promise.all(insertPromises);
  } catch (error) {
    log(`${dbname} contactInformation seeding error`, error);
    return;
  }
  log(`${dbname} contactInformation successfully seeded`);
  try {
    let patientsSeeds = await patients();
    const insertPromises = patientsSeeds.map(db.insert);
    patientsSeeds = await Promise.all(insertPromises);
  } catch (error) {
    log(`${dbname} patients seeding error`, error);
    return;
  }
  log(`${dbname} patients successfully seeded`);
};

if (require.main === module) ramSeeding();

module.exports = ramSeeding;
