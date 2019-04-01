'use strict';

const log = require('logger-file-fun-line');
const couch = require('../../db/connection');
const prefix = require('../../utils/prefix');
const trimId = require('../../utils/trimId');

const dbname = prefix('hw_0_ram');
const db = couch.use(dbname);

// indexes: doc.appointment,patient.ref,beginOfAppointment
// ddoc: view services

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
  // async services(chaild) {
  //   const response = await db.view('ddoc', 'services', {
  //     startkey: [chaild],
  //     endkey: [chaild, {}],
  //   });
  //   if (response.rows.length === 0) return null;
  //   const docs = {};
  //   response.rows.forEach((row) => {
  //     if (docs[row.value.ref]) {
  //       docs[row.value.ref].doctors.push({ _id: row.value.doctor, name: row.value.name });
  //     } else {
  //       docs[row.value.ref] = {
  //         _id: row.value.ref,
  //         child: row.value.child,
  //         presentation: row.value.presentation,
  //         doctors: [{ _id: row.value.doctor, name: row.value.name }],
  //       };
  //     }
  //   });
  //   return Object.values(docs);
  // },
};
