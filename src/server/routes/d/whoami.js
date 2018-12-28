'use strict';

const log = require('logger-file-fun-line');
const doctors = require('../../db/queries/doctors');

const whoami = async (ctx) => {
  try {
    const doctor = await doctors.getById(ctx.state.access.did);
    ctx.body = {
      status: 'success',
      message: `You are ${doctor.name}`,
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
