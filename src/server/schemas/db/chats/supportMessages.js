'use strict';

const Joi = require('joi');

const catPatientsOrDoctorsRegExp = new RegExp('^cat\\.(?:patients|doctors)\\|[a-f0-9]{8}-[a-f0-9]{4}-1[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$');

module.exports = Joi.object().keys({
  _id: Joi.string().uuid({ version: 'uuidv1' }).required(),
  type: Joi.string().valid('supportMessage').required(),
  chatId: Joi.string().uuid({ version: 'uuidv1' }).required(),
  from: Joi.string().regex(catPatientsOrDoctorsRegExp, 'cat.patientsORdoctors|uuidv1').required(),
  to: Joi.string().allow('').regex(catPatientsOrDoctorsRegExp, 'cat.patientsORdoctors|uuidv1').required(),
  sendDate: Joi.date().required(),
  receivedDate: Joi.date().required(),
  deliveredDate: Joi.date().allow('').required(),
  readDate: Joi.date().allow('').required(),
  meta: Joi.object().default({}),
  text: Joi.string().max(4096).required(),
});
