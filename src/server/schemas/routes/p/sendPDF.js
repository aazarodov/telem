'use strict';

const Joi = require('joi');

module.exports = {
  post: Joi.object().keys({
    barcode: Joi.string().required(),
  }),
};
