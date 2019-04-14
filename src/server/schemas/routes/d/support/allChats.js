'use strict';

const Joi = require('joi');

module.exports = {
  get: Joi.object().keys({
    titles: Joi.array().unique().items(Joi.string().max(255).required()).required(),
    closed: Joi.bool().required(),
    limit: Joi.number().positive().default(100),
    bookmark: Joi.string().default(''),
  }),
};
