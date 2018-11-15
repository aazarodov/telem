'use strict';

const Joi = require('joi');

module.exports = Joi.object().keys({
  login: Joi.string().min(3).max(255).required(),
  password: Joi.string().min(6).max(255).required(),
});
