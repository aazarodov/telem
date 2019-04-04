'use strict';

const log = require('logger-file-fun-line');
const doctors = require('../../db/queries/doctors');

const whoami = async (ctx) => {
  try {
    const doctor = await doctors.getById(ctx.state.access.did);
    const group = doctor.groupOfMis.name === 'Операторы' ? 'operator' : 'doctor';

    ctx.body = {
      status: 'success',
      message: `You are ${doctor.name}`,
      data: {
        doctor: {
          name: doctor.name,
          specialization: doctor.mitSpecialization.presentation,
          group,
          childDoctor: doctor.childDoctor,
          adultDoctor: doctor.adultDoctor,
          meta: doctor.meta,
        },
      },
    };
  } catch (error) {
    log(error);
    ctx.status = 500;
    ctx.body = {
      status: 'error',
      message: 'couchdb error',
      error: error.message,
    };
  }
};

module.exports = {
  get: whoami,
  post: whoami,
};
