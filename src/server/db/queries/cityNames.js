'use strict';

const log = require('logger-file-fun-line');
const couch = require('../connection');
const prefix = require('../../utils/prefix');

const dbname = prefix('hw_0_ram');
const className = 'cat.cities';

// indexes: class_name

const cityNames = async (limit, bookmark) => {
  const db = couch.use(dbname);
  const response = await db.find({
    selector: {
      class_name: className,
    },
    use_index: ['indexes', 'class_name'],
    fields: [
      'name',
    ],
    limit,
    bookmark,
  });
  return response;
};

module.exports = cityNames;
