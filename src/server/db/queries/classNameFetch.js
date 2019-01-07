'use strict';

const log = require('logger-file-fun-line');
const couch = require('../connection');
const prefix = require('../../utils/prefix');
const trimId = require('../../utils/trimId');

const dbname = prefix('hw_0_ram');

// indexes: class_name

const classNameFetch = async (className) => {
  const db = couch.use(dbname);
  const docs = {};
  const response = await db.find({
    selector: {
      class_name: className,
    },
    limit: Number.MAX_SAFE_INTEGER,
  });
  response.docs.forEach((doc) => {
    docs[doc.name] = {
      ref: trimId(doc._id),
      presentation: doc.name,
      type: className,
    };
  });
  return docs;
};

module.exports = classNameFetch;
