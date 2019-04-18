'use strict';

const log = require('logger-file-fun-line');
const schedule = require('../../../db/queries/workSchedule');
const trimDate = require('../../../utils/trimDate');
const { scheduleMaxDays } = require('../../../../../secrets');

const daysBetween = (begin, end) => Math.floor(((+end) - (+begin)) / 8.64e7);

module.exports = {
  get: async (ctx) => {
    const days = daysBetween(ctx.state.data.dateGTE, ctx.state.data.dateLT);
    if (days <= 0) {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: 'wrong number of days between dateGTE and dateLT',
        error: `${days} <= 0`,
      };
      return;
    }
    if (days > scheduleMaxDays) {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: 'too many days between dateGTE and dateLT',
        error: `${days} > ${scheduleMaxDays}`,
      };
      return;
    }
    // TODO dateGTE >= today
    const schedulePromises = [];
    const specialists = Array.isArray(ctx.state.data.specialist)
      ? ctx.state.data.specialist : [ctx.state.data.specialist];
    const companies = Array.isArray(ctx.state.data.company)
      ? ctx.state.data.company : [ctx.state.data.company];
    specialists.forEach((specialist) => {
      schedulePromises.push(schedule(
        specialist,
        companies,
        trimDate(ctx.state.data.dateGTE),
        trimDate(ctx.state.data.dateLT),
      ));
    });
    try {
      const response = await Promise.all(schedulePromises);
      const data = {};
      specialists.forEach((specialist, index) => {
        data[specialist] = response[index];
      });
      ctx.body = {
        status: 'success',
        message: 'schedule trees',
        data,
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
