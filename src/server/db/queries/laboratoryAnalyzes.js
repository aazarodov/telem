'use strict';

const log = require('logger-file-fun-line');
const couch = require('../connection');
const trimId = require('../../utils/trimId');
const prefix = require('../../utils/prefix');

const dbname = prefix('hw_0_ram');
const className = 'doc.laboratoryAnalyzes';

// indexes: class_name,patient.ref

const laboratoryAnalyzes = async (pid, limit, bookmark) => {
  const db = couch.use(dbname);
  const response = await db.find({
    selector: {
      class_name: className,
      'patient.ref': trimId(pid),
    },
    use_index: ['indexes', 'class_name,patient.ref'],
    limit,
    bookmark,
  });
  return response;
};

module.exports = laboratoryAnalyzes;
