'use strict';

const log = require('logger-file-fun-line');
const couch = require('../connection');
const trimId = require('../../utils/trimId');
const prefix = require('../../utils/prefix');

const dbname = prefix('hw_0_ram');
const className = 'cat.insurancePolicies';

// indexes: class_name,ownerOfObject.ref

const insurancePolicies = async (pid, limit, bookmark) => {
  const db = couch.use(dbname);
  const response = await db.find({
    selector: {
      class_name: className,
      'ownerOfObject.ref': trimId(pid),
    },
    use_index: ['indexes', 'class_name,ownerOfObject.ref'],
    fields: [
      'name',
      'dateOfStartInsurance',
      'dateofEndInsurance',
      'noActive',
      'insuranceCompany.presentation',
      'kindOfInsurance.presentation',
    ],
    limit,
    bookmark,
  });
  return response;
};

module.exports = insurancePolicies;
