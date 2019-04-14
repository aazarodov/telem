'use strict';

const Joi = require('joi');

module.exports = {
  get: Joi.object().keys({
    specialist: Joi.alternatives([
      Joi.string().uuid().required(),
      Joi.array().unique().items(Joi.string().uuid().required()).required(),
    ]),
    company: Joi.alternatives([
      Joi.string().uuid().required(),
      Joi.array().unique().items(Joi.string().uuid().required()).required(),
    ]),
    dateGTE: Joi.date().required(), // greater than or equal
    dateLT: Joi.date().required(), // less than
  }),
};
