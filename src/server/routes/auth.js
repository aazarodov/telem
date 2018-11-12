'use strict';

const Router = require('koa-router');
const registerSchema = require('./schemas/register');
const patients = require('../db/queries/patients');
const log = require('../utils/logger');

const router = new Router();

router.post('/auth/register', async (ctx) => {
  const postedPatient = ctx.request.body;
  try {
    await registerSchema.validate(postedPatient);
  } catch (error) {
    ctx.status = 400;
    ctx.body = {
      status: 'error',
      message: 'register post data validate error',
      error: error.message,
    };
    return;
  }
  let foundPatient;
  try {
    foundPatient = await patients.getByPhone(postedPatient.phone_numbers);
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
    if (foundPatient.status === 'Активен') {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: 'patient with this phone number already exist',
        error: 'patient with this phone number already exist',
      };
      return;
    }
    const patientDataMismatch = {};
    Object.keys(postedPatient).forEach((fieldName) => {
      if (
        fieldName !== 'Password'
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
    // TODO add patientDataMismatch to notes
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
});

router.post('/auth/sms/send', async (ctx) => {
  ctx.body = {
    status: 'success',
    message: 'sms send',
  };
});

router.post('/auth/sms/check', async (ctx) => {
  ctx.body = {
    status: 'success',
    message: 'sms check',
  };
});

router.post('/auth/login', async (ctx) => {
  ctx.body = {
    status: 'success',
    message: 'login',
  };
});

router.post('/auth/logout', async (ctx) => {
  ctx.body = {
    status: 'success',
    message: 'logout',
  };
});

module.exports = router;
