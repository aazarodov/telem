'use strict';

const log = require('logger-file-fun-line');
const loginSchema = require('../../schemas/routes/login');
const patients = require('../../db/queries/patients');

module.exports = {
  '/': {
    post: async (ctx) => {
      try {
        await loginSchema.validate(ctx.request.body);
      } catch (error) {
        ctx.status = 400;
        ctx.body = {
          status: 'error',
          message: 'login post data validate error',
          error: error.message,
        };
        return;
      }
      const { login, password } = ctx.request.body;
      const foundPatient = await patients.login(login, password);
      if (foundPatient) {
        if (foundPatient.status.presentation === 'Активен') {
          const { surname, firstName, patronymic } = foundPatient;
          ctx.status = 200;
          ctx.body = {
            status: 'success',
            message: 'login successful',
            data: {
              accessToken: 'some-random-string',
              patient: { surname, firstName, patronymic },
            }, // TODO save accessToken to storage
          };
        } else {
          ctx.status = 400;
          ctx.body = {
            status: 'error',
            message: 'patient not activeted',
            error: `patient.status is ${foundPatient.status} expected "Активен"`,
          };
        }
      } else {
        ctx.status = 404;
        ctx.body = {
          status: 'error',
          message: 'patient with this login and password not found',
          error: 'patient with this login and password not found',
        };
      }
    },
  },
};
