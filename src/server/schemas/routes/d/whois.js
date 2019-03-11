'use strict';

const Joi = require('joi');

const catPatientsRegExp = new RegExp('^cat\\.patients\\|[a-f0-9]{8}-[a-f0-9]{4}-1[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$');

module.exports = {
  get: Joi.object().keys({
    patientId: Joi.string().regex(catPatientsRegExp, 'cat.patients|uuidv1').required(),
  }),
};
