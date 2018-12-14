'use strict';

const Joi = require('joi');

const catPatientsRegExp = new RegExp('^cat\\.patients\\|[a-f0-9]{8}-[a-f0-9]{4}-1[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$');


module.exports = Joi.object().keys({
  _id: Joi.string().uuid({ version: 'uuidv1' }).required(),
  owner: Joi.string().regex(catPatientsRegExp, 'cat.patients|uuidv1').required(),
  name: Joi.string().max(255).required(),
  date: Joi.date().required(),
  type: Joi.string().max(255).required(),
  length: Joi.number().integer().positive().required(),
  comment: Joi.string().allow('').max(255).required(),
});
