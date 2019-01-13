'use strict';

const Joi = require('joi');

module.exports = {
  get: Joi.object().keys({
    barcode: Joi.string().required(),
    lastName: Joi.string().max(255).required(),
    birthDate: Joi.date().required(),
  }),
};
