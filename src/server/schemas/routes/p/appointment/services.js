'use strict';

const Joi = require('joi');

module.exports = {
  get: Joi.object().keys({
    chaild: Joi.bool().required(),
  }),
};
