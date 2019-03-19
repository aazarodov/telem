'use strict';

const log = require('logger-file-fun-line');
const appointments = require('../../../db/queries/appointments');
const dateTime = require('../../../utils/dateTimeFor1C');

module.exports = {
  get: async (ctx) => {
    try {
      if (ctx.state.data._id) {
        const doc = await appointments.getById(
          ctx.state.data._id,
          ctx.state.access.pid,
        );
        if (doc) {
          ctx.body = {
            status: 'success',
            message: 'appointment doc',
            data: doc,
          };
        } else {
          ctx.status = 404;
          ctx.body = {
            status: 'error',
            message: 'appointment not found',
          };
        }
        return;
      }
      const list = await appointments.list(
        ctx.state.access.pid,
        ctx.state.data.beginOfAppointmentDateGTE === '' ? '' : dateTime(ctx.state.data.beginOfAppointmentDateGTE),
        ctx.state.data.beginOfAppointmentDateLT === 'infinity' ? 'infinity' : dateTime(ctx.state.data.beginOfAppointmentDateLT),
        ctx.state.data.limit,
        ctx.state.data.bookmark,
      );
      ctx.body = {
        status: 'success',
        message: 'appointments list',
        data: list,
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
