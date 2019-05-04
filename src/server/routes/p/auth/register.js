'use strict';

const log = require('logger-file-fun-line');
const patients = require('../../../db/queries/patients');
const { decrypt } = require('../../../utils/crypto');
const unixtimestamp = require('../../../utils/unixtimestamp');
const dateTime = require('../../../utils/dateTimeFor1C');

module.exports = {
  post: async (ctx) => {
    const postedPatient = ctx.state.data;
    let tokenData;
    try {
      tokenData = await decrypt(postedPatient.registerToken);
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
    delete postedPatient.registerToken;
    postedPatient.phoneNumber = tokenData.phoneNumber;
    let foundPatient;
    try {
      foundPatient = await patients.getByphoneNumber(postedPatient.phoneNumber);
      if (!foundPatient) {
        await patients.registerNew(postedPatient);
        ctx.status = 201;
        ctx.body = {
          status: 'success',
          message: 'new patient created',
        };
        return;
      }
      if (foundPatient.status.presentation === 'Активен'
        || foundPatient.status.presentation === 'Новый') {
        // || foundPatient.status.presentation === 'Не активирован') {
        ctx.status = 400;
        ctx.body = {
          status: 'error',
          message: 'patient with this phone number already exist',
          error: 'patient with this phone number already exist',
        };
        return;
      }
      const patientDataMismatch = {};
      postedPatient.birthDate = dateTime(postedPatient.birthDate);
      if (postedPatient.lastName !== foundPatient.lastName) {
        patientDataMismatch.lastName = postedPatient.lastName;
      }
      if (postedPatient.firstName !== foundPatient.firstName) {
        patientDataMismatch.firstName = postedPatient.firstName;
      }
      if (postedPatient.middleName !== foundPatient.middleName) {
        patientDataMismatch.middleName = postedPatient.middleName;
      }
      if (postedPatient.birthDate !== foundPatient.birthDate) {
        patientDataMismatch.birthDate = postedPatient.birthDate;
      }
      if (postedPatient.sex !== foundPatient.sex.name) {
        patientDataMismatch.sex = postedPatient.sex;
      }
      await patients.registerUpdate(foundPatient, postedPatient, patientDataMismatch);
      if (Object.keys(patientDataMismatch).length !== 0) {
        ctx.status = 200;
        ctx.body = {
          status: 'success',
          message: 'stored patient updated with data mismatch',
        };
        return;
      }
      ctx.status = 200;
      ctx.body = {
        status: 'success',
        message: 'stored patient updated without data mismatch',
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
