'use strict';

const log = require('logger-file-fun-line');
const patients = require('../../db/queries/patients');
const { encrypt } = require('../../utils/crypto');
const { accessExpiry } = require('../../../../secrets');
const unixtimestamp = require('../../utils/unixtimestamp');

module.exports = {
  post: async (ctx) => {
    const { login, password } = ctx.state.data;
    const foundPatient = await patients.login(login, password);
    if (foundPatient) {
      if (foundPatient.status.presentation === 'Активен'
        || foundPatient.status.presentation === 'Новый') {
        const { lastName, firstName, middleName } = foundPatient;
        const pid = foundPatient._id;
        const expiry = unixtimestamp() + accessExpiry;
        ctx.cookies.set(
          'pat', // Patient Access Token
          await encrypt({ pid, expiry }),
          {
            expires: new Date(expiry * 1000),
            httpOnly: true,
          },
        );
        ctx.body = {
          status: 'success',
          message: 'login successful',
          data: {
            patient: { lastName, firstName, middleName },
          },
        };
      } else {
        ctx.status = 400;
        ctx.body = {
          status: 'error',
          message: 'patient not activeted',
          error: `patient.status is ${foundPatient.status} expected "Активен"/"Новый"`,
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
};
