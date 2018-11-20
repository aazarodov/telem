'use strict';

const log = require('logger-file-fun-line');
const patients = require('../db/queries/patients');

const whoami = async (ctx) => {
  if (!ctx.state.access) {
    ctx.status = 400;
    ctx.body = {
      status: 'error',
      message: 'access error',
    };
    return;
  }
  if (ctx.state.access.pid) {
    const patient = await patients.getByPID(ctx.state.access.pid);
    ctx.body = {
      status: 'success',
      message: `You are ${patient.name}`,
    };
  } else {
    ctx.body = {
      status: 'success',
      message: 'You are unknown',
    };
  }
};

module.exports = {
  '/': {
    get: whoami,
    post: whoami,
  },
};
