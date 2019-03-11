'use strict';

const log = require('logger-file-fun-line');
const patients = require('../../db/queries/patients');

module.exports = {
  get: async (ctx) => {
    try {
      const patient = await patients.getById(ctx.state.access.pid);
      delete patient._id;
      delete patient._rev;
      delete patient.password;
      delete patient.note;
      delete patient.status;
      ctx.body = {
        status: 'success',
        message: 'patient info',
        data: patient,
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
  },
};
