'use strict';

const Joi = require('joi');

const catPatientsRegExp = new RegExp('^cat\\.patients\\|[a-f0-9]{8}-[a-f0-9]{4}-1[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$');

module.exports = Joi.object().keys({
  _id: Joi.string().uuid({ version: 'uuidv1' }).required(),
  type: Joi.string().valid('memo').required(),
  pid: Joi.string().regex(catPatientsRegExp, 'cat.patients|uuidv1').required(),
  text: Joi.string().max(255).required(),
  createDate: Joi.date().required(),
  shotDate: Joi.date().allow(null).required(),
  expiryDate: Joi.date().allow(null).required(),
  shot: Joi.bool().required(),
});
