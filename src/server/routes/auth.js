'use strict';

const Router = require('koa-router');
const registerSchema = require('./schemas/register');
const loginSchema = require('./schemas/login');
const logoutSchema = require('./schemas/logout');
const dateTime = require('../utils/dateTimeFor1C');
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
});

router.post('/auth/login', async (ctx) => {
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
});

router.post('/auth/logout', async (ctx) => {
  try {
    await logoutSchema.validate(ctx.request.body);
  } catch (error) {
    ctx.status = 400;
    ctx.body = {
      status: 'error',
      message: 'logout post data validate error',
      error: error.message,
    };
    return;
  } // TODO del accessToken from storage
  ctx.status = 200;
  ctx.body = {
    status: 'success',
    message: 'logout successful',
  };
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

module.exports = router;
