'use strict';

const log = require('logger-file-fun-line');
const registerSchema = require('../../schemas/routes/register');
const dateTime = require('../../utils/dateTimeFor1C');
const patients = require('../../db/queries/patients');
const { decrypt } = require('../../utils/token');
const unixtimestamp = require('../../utils/unixtimestamp');

module.exports = {
  '/': {
    post: async (ctx) => {
      const postedPatient = ctx.request.body;
      try {
        await registerSchema.validate(postedPatient);
      } catch (error) {
        ctx.status = 400;
        ctx.body = {
          status: 'error',
          message: 'validate error',
          error: { message: error.message, body: ctx.request.body },
        };
        return;
      }
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
      if (now >= tokenData.expiry) {
        ctx.status = 400;
        ctx.body = {
          status: 'error',
          message: 'registerToken expired',
          error: { expiry: tokenData.expiry, now },
        };
        return;
      }
      delete postedPatient.registerToken; // TODO remove this field
      delete postedPatient.expiry; // TODO remove this field
      postedPatient.mobileNumber = tokenData.mobileNumber;
      let foundPatient;
      try {
        foundPatient = await patients.getByPhone(postedPatient.mobileNumber);
        if (!foundPatient) {
          const newPatient = await patients.insertNew(postedPatient);
          ctx.status = 201;
          ctx.body = {
            status: 'success',
            message: 'new patient created',
            data: newPatient,
          };
          // TODO send email to admin with newPatient data
          return;
        }
        if (foundPatient.status.presentation === 'Активен') {
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
        Object.keys(postedPatient).forEach((fieldName) => {
          if (
            fieldName !== 'password'
            && foundPatient[fieldName]
            && postedPatient[fieldName] !== foundPatient[fieldName]
            && fieldName !== 'sex'
          ) {
            patientDataMismatch[fieldName] = postedPatient[fieldName];
          }
        });
        if (Object.keys(patientDataMismatch).length === 0) {
          const updPatient = await patients.updateClean(
            foundPatient._id, // eslint-disable-line no-underscore-dangle
            foundPatient._rev, // eslint-disable-line no-underscore-dangle
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
  },
};
