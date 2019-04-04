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
    try {
      const response = await schedule(
        ctx.state.data.specialist,
        ctx.state.data.company,
        trimDate(ctx.state.data.dateGTE),
        trimDate(ctx.state.data.dateLT),
      );
      ctx.body = {
        status: 'success',
        message: 'schedule tree',
        data: response,
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
