'use strict';

const Joi = require('joi');

module.exports = Joi.object().keys({
  mobileNumber: Joi.string().min(3).max(255).required(),
});
