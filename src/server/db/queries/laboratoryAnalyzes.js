'use strict';

const log = require('logger-file-fun-line');
const couch = require('../connection');
const trimId = require('../../utils/trimId');
const prefix = require('../../utils/prefix');

const dbname = prefix('hw_0_ram');
const className = 'doc.laboratoryAnalyzes';
const db = couch.use(dbname);

// indexes: class_name,patient.ref

module.exports = {
  async list(pid, limit, bookmark) {
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
  },
  async getById(pid, _id) {
    try {
      const doc = await db.get(_id);
      if (doc.class_name !== className) {
        throw new Error(`getById class_name === ${doc.class_name}, expect ${className}`);
      }
      if (doc.patient.ref !== trimId(pid)) return null;
      return doc;
    } catch (error) {
      if (error.error === 'not_found') return null;
      throw error;
    }
  },
};
