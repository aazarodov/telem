'use strict';

const Joi = require('joi');

module.exports = Joi.object().keys({
  _id: Joi.string().alphanum().min(3).max(16).required(),
  expiry: Joi.number().integer().positive().required(),
});
