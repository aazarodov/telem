'use strict';

const Joi = require('joi');

module.exports = {
  get: Joi.object().keys({
    barcode: Joi.string().required(),
  }),
};
