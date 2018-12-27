'use strict';

const Joi = require('joi');

module.exports = {
  get: Joi.object().keys({
    limit: Joi.number().positive().default(100),
    bookmark: Joi.string().default(''),
  }),
};
