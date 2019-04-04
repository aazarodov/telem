'use strict';

const Joi = require('joi');

const dateTimeRegExp = new RegExp('^20\\d\\d-(?:0[1-9]|1[012])-(?:0[1-9]|[12][0-9]|3[01])T(?:[0-1][0-9]|2[0-3]):(?:[0-5][0-9]):00$');


module.exports = {
  post: Joi.object().keys({
    patient: Joi.object().keys({
      ref: Joi.string().uuid({ version: 'uuidv1' }).required(),
      presentation: Joi.string().required(),
    }).required(),
    service: Joi.object().keys({
      ref: Joi.string().uuid({ version: 'uuidv1' }).required(),
      presentation: Joi.string().required(),
    }).required(),
    specialist: Joi.object().keys({
      ref: Joi.string().uuid({ version: 'uuidv1' }).required(),
      presentation: Joi.string().required(),
    }).required(),
    company: Joi.object().keys({
      ref: Joi.string().uuid({ version: 'uuidv1' }).required(),
      presentation: Joi.string().required(),
    }).required(),
    beginOfAppointment: Joi.string().regex(dateTimeRegExp, 'dateTimeRegExp').required(),
    endOfAppointment: Joi.string().regex(dateTimeRegExp, 'dateTimeRegExp').required(),
  }),
};
