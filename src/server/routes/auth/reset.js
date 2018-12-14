'use strict';

const log = require('logger-file-fun-line');
const patients = require('../../db/queries/patients');
const { decrypt } = require('../../utils/crypto');
const unixtimestamp = require('../../utils/unixtimestamp');

module.exports = {
  post: async (ctx) => {
    let tokenData;
    try {
      tokenData = await decrypt(ctx.state.data.registerToken);
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: 'registerToken incorrect',
        error,
      };
      return;
    }
    const now = unixtimestamp();
    if (now > tokenData.expiry) {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: 'registerToken expired',
        error: { expiry: tokenData.expiry, now },
      };
      return;
    }
    const { password } = ctx.state.data;
    const { phoneNumber } = tokenData;
    let foundPatient;
    try {
      foundPatient = await patients.getByphoneNumber(phoneNumber);
      if (foundPatient) {
        if (foundPatient.status.presentation === 'Активен'
          || foundPatient.status.presentation === 'Новый') {
          await patients.resetPassword(foundPatient, password);
          ctx.body = {
            status: 'success',
            message: 'reset password successful',
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
          message: 'patient with this phoneNumber not found',
          error: 'patient with this phoneNumber not found',
        };
      }
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
