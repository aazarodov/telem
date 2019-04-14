'use strict';

const log = require('logger-file-fun-line');
const couch = require('../connection');
const prefix = require('../../utils/prefix');
const trimId = require('../../utils/trimId');

const dbname = prefix('hw_0_ram');
const db = couch.use(dbname);

// indexes: doc.appointment,patient.ref,beginOfAppointment

module.exports = {
  async getById(_id, pid) {
    try {
      const doc = await db.get(_id);
      if (doc.class_name !== 'doc.appointment' || trimId(pid) !== doc.patient.ref) {
        return null;
      }
      return doc;
    } catch (error) {
      if (error.error === 'not_found') return null;
      throw error;
    }
  },
  async list(pid, beginOfAppointmentGTE, beginOfAppointmentLT, limit, bookmark) {
    return db.find({
      selector: {
        'patient.ref': trimId(pid),
        beginOfAppointment: {
          $gte: beginOfAppointmentGTE,
          $lt: beginOfAppointmentLT,
        },
      },
      sort: [{ beginOfAppointment: 'asc' }],
      use_index: ['indexes', 'doc.appointment,patient.ref,beginOfAppointment'],
      limit,
      bookmark,
    });
  },
};
