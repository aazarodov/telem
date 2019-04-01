'use strict';

const log = require('logger-file-fun-line');
const couch = require('../connection');
const prefix = require('../../utils/prefix');
const trimId = require('../../utils/trimId');

const dbname = prefix('hw_0_ram');
const db = couch.use(dbname);

// indexes: class_name, ireg.filters,company.ref

let companiesByCityHandle = null;

const companiesByCity = async (cityName) => {
  if (typeof companiesByCityHandle === 'function') return companiesByCityHandle(cityName);
  const response = await db.find({
    selector: {
      class_name: 'cat.companies',
    },
    fields: ['_id', 'cityOfCompany.presentation'],
    use_index: ['indexes', 'class_name'],
    limit: Number.MAX_SAFE_INTEGER,
  });
  const companies = {};
  response.docs.forEach((val) => {
    if (!companies[val.cityOfCompany.presentation]) {
      companies[val.cityOfCompany.presentation] = [];
    }
    companies[val.cityOfCompany.presentation].push(trimId(val._id));
  });
  companiesByCityHandle = cName => companies[cName];
  return companiesByCityHandle(cityName);
};

module.exports = async (cityName, sex, age) => {
  const selector = {};
  selector['company.ref'] = { $in: await companiesByCity(cityName) };
  if (sex === 'male') selector['records.0.male'] = true;
  else selector['records.0.female'] = true;
  if (age === 'child') selector['records.0.child'] = true;
  else selector['records.0.adult'] = true;
  const response = await db.find({
    selector,
    fields: [
      'service.ref',
      'service.presentation',
      'company.ref',
      'company.presentation',
      'specialist.ref',
      'specialist.presentation',
    ],
    use_index: ['indexes', 'ireg.filters,company.ref'],
    limit: Number.MAX_SAFE_INTEGER,
  });
  return response.docs;
};
