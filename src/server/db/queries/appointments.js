'use strict';

const log = require('logger-file-fun-line');
const couch = require('../../db/connection');
const prefix = require('../../utils/prefix');
const trimId = require('../../utils/trimId');
const id = require('../../utils/_id')('doc.appointment');

const dbname = prefix('hw_0_ram');
const db = couch.use(dbname);

// indexes: doc.appointment,patient.ref,beginOfAppointment

const dateWithTimeFor1C = () => {
  const date = new Date();
  return (new Date(date.getTime() - date.getTimezoneOffset() * 60000)).toJSON().slice(0, 19);
};

const getNumberFor1C = () => Math.floor(Math.random() * (100000 - 9999)) + 9999;

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
  // patient, recipient, service, specialist, company, beginOfAppointment
  async create2(postData) {
    const newDoc = {
      _id: id(),
      date: dateWithTimeFor1C(),
      company: {
        ref: postData.company.ref,
        presentation: postData.company.presentation,
        type: 'cat.companies',
      },
      note: '',
      documentLink: '',
      patient: {
        ref: postData.patient.ref,
        presentation: postData.patient.presentation,
        type: 'cat.patients',
      },
      specialization: {
        ref: '6135a5ce-454f-11e4-9b57-001517b46888',
        presentation: 'Хирург',
        type: 'cat.specializations',
      },
      oneTimeContractNumber: `И-${getNumberFor1C()}`,
      percentDiscount: 0,
      recipient: {
        ref: '00000000-0000-0000-0000-000000000000',
        presentation: '',
        type: 'cat.patients',
      },
      beginOfAppointment: postData.beginOfAppointment,
      office: {
        ref: '292352bd-32f4-11e9-8101-f41614cd568a',
        presentation: 'Кабинет №1',
        type: 'cat.offices',
      },
      endOfAppointment: postData.endOfAppointment,
      specialist: {
        ref: postData.specialist.ref,
        presentation: postData.specialist.presentation,
        type: 'cat.doctors',
      },
      appointmentServices: [
        {
          analyzesAndServices: {
            ref: postData.service.ref,
            presentation: postData.service.presentation,
            type: 'cat.analyzesAndServices',
          },
          price: 800,
          summ: 800,
          summDiscount: 0,
          percentDiscount: 0,
          stringGUID: 'eeeaaae6-925a-4a66-91d8-5edd11ea1b5a',
          isSet: false,
        },
      ],
      class_name: 'doc.appointment',
    };
    return db.insert(newDoc);
  },
};
