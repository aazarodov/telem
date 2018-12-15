'use strict';

const log = require('logger-file-fun-line');
const couch = require('../connection');
const prefix = require('../../utils/prefix');

const dbname = prefix('hw_0_ram');
const className = 'cat.patientStatuses';

// indexes: class_name

const patientStatusesFetch = async () => {
  const db = couch.use(dbname);
  const patientStatus = {};
  const response = await db.find({
    selector: {
      class_name: className,
    },
  });
  response.docs.forEach((doc) => {
    patientStatus[doc.name] = {
      ref: doc._id.slice(className.length + 1),
      presentation: doc.name,
      type: className,
    };
  });
  return patientStatus;
};

module.exports = patientStatusesFetch;
