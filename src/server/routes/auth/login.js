'use strict';

const log = require('logger-file-fun-line');
const loginSchema = require('../../schemas/routes/login');
const patients = require('../../db/queries/patients');
const { encrypt } = require('../../utils/token');
const { accessExpiry } = require('../../../../secrets');
const unixtimestamp = require('../../utils/unixtimestamp');

module.exports = {
  '/': {
    post: async (ctx) => {
      try {
        await loginSchema.validate(ctx.request.body);
      } catch (error) {
        ctx.status = 400;
        ctx.body = {
          status: 'error',
          message: 'validate error',
          error: { message: error.message, body: ctx.request.body },
        };
        return;
      }
      const { login, password } = ctx.request.body;
      const foundPatient = await patients.login(login, password);
      if (foundPatient) {
        if (foundPatient.status.presentation === 'Активен') {
          const { surname, firstName, patronymic } = foundPatient;
          ctx.body = {
            status: 'success',
            message: 'login successful',
            data: {
              accessToken: await encrypt({
                pid: foundPatient._id, // eslint-disable-line no-underscore-dangle
                expiry: unixtimestamp() + accessExpiry,
              }),
              patient: { surname, firstName, patronymic },
            },
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
