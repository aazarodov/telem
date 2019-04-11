'use strict';

const log = require('logger-file-fun-line');
const patients = require('../../db/queries/patients');

const whoami = async (ctx) => {
  try {
    const patient = await patients.getById(ctx.state.access.pid);
    if (!patient) {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: 'You are unknown',
      };
    }
    ctx.body = {
      status: 'success',
      message: `You are ${patient.name}`,
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
