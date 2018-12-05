'use strict';

const log = require('logger-file-fun-line');
const couch = require('../connection');
const trimId = require('../../utils/trimId');

const prefix = process.env.NODE_ENV === 'test' ? 'test_' : '';
const dbname = `${prefix}hw_0_ram`;
const className = 'doc.laboratoryAnalyzes';

// indexes: class_name-patient.ref

const laboratoryAnalyzesFetch = async (_id, limit, bookmark) => {
  const db = couch.use(dbname);
  const response = await db.find({
    selector: {
      class_name: className,
      'patient.ref': trimId(_id),
    },
    use_index: ['indexes', 'class_name-patient.ref'],
    limit,
    bookmark,
  });
  return response;
};

module.exports = laboratoryAnalyzesFetch;
