'use strict';

const Joi = require('joi');

const catPatientsRegExp = new RegExp('^cat\\.patients\\|[a-f0-9]{8}-[a-f0-9]{4}-1[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$');
const catDoctorsRegExp = new RegExp('^cat\\.doctors\\|[a-f0-9]{8}-[a-f0-9]{4}-1[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$');

module.exports = Joi.object().keys({
  _id: Joi.string().uuid({ version: 'uuidv1' }).required(),
  type: Joi.string().valid('supportChat').required(),
  pid: Joi.string().regex(catPatientsRegExp, 'cat.patients|uuidv1').required(),
  did: Joi.string().allow('').regex(catDoctorsRegExp, 'cat.doctors|uuidv1').required(),
  title: Joi.string().max(255).required(),
  meta: Joi.object().default({}),
  openDate: Joi.date().required(),
  closeDate: Joi.date().allow('').required(),
});
