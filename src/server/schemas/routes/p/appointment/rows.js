'use strict';

const Joi = require('joi');

module.exports = {
  get: Joi.object().keys({
    cityName: Joi.string().required(),
    sex: Joi.string().valid(['male', 'female']).required(),
    age: Joi.string().valid(['child', 'adult']).required(),
  }),
};
