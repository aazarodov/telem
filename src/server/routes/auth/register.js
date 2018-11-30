'use strict';

const log = require('logger-file-fun-line');
const patients = require('../../db/queries/patients');
const { decrypt } = require('../../utils/crypto');
const unixtimestamp = require('../../utils/unixtimestamp');
const dateTime = require('../../utils/dateTimeFor1C');

module.exports = {
  post: async (ctx) => {
    const postedPatient = ctx.request.body;
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
    postedPatient.mobileNumber = tokenData.mobileNumber;
    let foundPatient;
    try {
      foundPatient = await patients.getByMobileNumber(postedPatient.mobileNumber);
      if (!foundPatient) {
        const newPatient = await patients.insertNew(postedPatient);
        ctx.status = 201;
        ctx.body = {
          status: 'success',
          message: 'new patient created',
          data: newPatient,
        };
        return;
      }
      if (foundPatient.status.presentation === 'Активен'
        || foundPatient.status.presentation === 'Новый') {
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
      if (foundPatient.lastName && postedPatient.surname !== foundPatient.lastName) {
        patientDataMismatch.lastName = postedPatient.surname;
      }
      if (foundPatient.firstName && postedPatient.firstName !== foundPatient.firstName) {
        patientDataMismatch.firstName = postedPatient.firstName;
      }
      if (foundPatient.middleName && postedPatient.patronymic !== foundPatient.middleName) {
        patientDataMismatch.middleName = postedPatient.patronymic;
      }
      if (foundPatient.birthDate && postedPatient.birthDate !== foundPatient.birthDate) {
        patientDataMismatch.birthDate = postedPatient.birthDate;
      }
      if (foundPatient.sex && postedPatient.sex !== foundPatient.sex.name) {
        patientDataMismatch.sex = postedPatient.sex;
      }
      if (Object.keys(patientDataMismatch).length === 0) {
        const updPatient = await patients.updateClean(
          foundPatient._id,
          foundPatient._rev,
          postedPatient,
        );
        ctx.status = 200;
        ctx.body = {
          status: 'success',
          message: 'stored patient updated without data mismatch',
          data: updPatient,
        };
        return;
      }
      const updPatient = await patients.updateDataMismatch(foundPatient, patientDataMismatch);
      ctx.status = 200;
      ctx.body = {
        status: 'success',
        message: 'stored patient updated with data mismatch',
        data: updPatient,
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
