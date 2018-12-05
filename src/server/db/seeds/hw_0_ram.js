'use strict';

process.env.NODE_ENV = 'test';

const path = require('path');
const fs = require('fs');
const util = require('util');
const log = require('logger-file-fun-line');
const couch = require('../connection');
const { deepReaddir } = require('../../utils/deepReaddir');

const readFile = util.promisify(fs.readFile);

const dbname = 'test_hw_0_ram';
const jsonDir = path.join(__dirname, 'hw_0_ram');
const schemasDir = path.join(__dirname, '../../schemas/db/hw_0_ram');

const ramSeeding = async () => {
  try {
    await couch.db.destroy(dbname);
  } catch (error) {
    log(`${dbname} does not exist`);
  }
  await couch.db.create(dbname);
  const db = couch.use(dbname);
  const schemas = {};
  try {
    const list = await deepReaddir(schemasDir);
    list.forEach((file) => {
      const fileParse = path.parse(file);
      try {
        const validatorName = fileParse.name;
        // eslint-disable-next-line global-require, import/no-dynamic-require
        schemas[validatorName] = require(file);
      } catch (error) {
        log(`${fileParse.base} validator require error`);
      }
    });
  } catch (error) {
    log(error);
    return;
  }
  const bulk = {};
  bulk.docs = [];
  try {
    const list = await deepReaddir(jsonDir, '.json');
    const seedsPromises = list.map(async (file) => {
      const fileParse = path.parse(file);
      let seeds;
      try {
        seeds = JSON.parse(await readFile(file));
      } catch (error) {
        log(`${fileParse.base} JSON read error`);
        throw error;
      }
      try {
        if (schemas[fileParse.name]) {
          const validatePromises = seeds.map(seed => schemas[fileParse.name].validate(seed));
          seeds = await Promise.all(validatePromises);
          bulk.docs.push(...seeds);
          log(`${fileParse.name} validated successful`);
        } else {
          bulk.docs.push(...seeds);
          log(`${fileParse.name} add without validation`);
        }
      } catch (error) {
        log(`${fileParse.name} validate error`);
        throw error;
      }
    });
    await Promise.all(seedsPromises);
  } catch (error) {
    log(error);
    return;
  }
  try {
    await db.bulk(bulk);
  } catch (error) {
    log(`${dbname} bulk error`, error);
  }
  log(`${dbname} successfully seeded`);
};

if (require.main === module) ramSeeding();

module.exports = ramSeeding;
