'use strict';

const Joi = require('joi');

module.exports = {
  get: Joi.alternatives([
    Joi.object().keys({
      _id: Joi.string().uuid({ version: 'uuidv1' }).required(),
    }),
    Joi.object().keys({
      limit: Joi.number().positive().default(100),
      bookmark: Joi.string().default(''),
    }),
  ]),
};
