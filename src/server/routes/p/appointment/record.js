'use strict';

const log = require('logger-file-fun-line');
const fetch = require('node-fetch');
const { createAppointmentUrl, OneSToken } = require('../../../../../secrets');
const trimId = require('../../../utils/trimId');

module.exports = {
  post: async (ctx) => {
    try {
      const response = await fetch(createAppointmentUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: OneSToken,
          // patient: '9f625211-1aba-11df-abab-001517b46888',
          patient: trimId(ctx.state.access.pid),
          recipient: ctx.state.access.pidOrigin ? trimId(ctx.state.access.pidOrigin) : '',
          service: ctx.state.data.service,
          specialist: ctx.state.data.specialist,
          company: ctx.state.data.company,
          beginOfAppointment: ctx.state.data.beginOfAppointment,
          endOfAppointment: ctx.state.data.endOfAppointment,
        }),
      });
      const responseText = await response.text();
      if (responseText === '{appointment:00000000-0000-0000-0000-000000000000}') {
        ctx.status = 400;
        ctx.body = {
          status: 'error',
          message: 'appointment already taken',
        };
      } else if (responseText.indexOf('{appointment:') === -1) {
        ctx.status = 400;
        ctx.body = {
          status: 'error',
          message: 'appointment record error',
          error: responseText,
        };
      } else {
        ctx.body = {
          status: 'success',
          message: 'appointment record created',
          data: responseText,
        };
      }
    } catch (error) {
      log(error);
      ctx.status = 500;
      ctx.body = {
        status: 'error',
        message: 'createAppointmen error',
        error,
      };
    }
  },
};
