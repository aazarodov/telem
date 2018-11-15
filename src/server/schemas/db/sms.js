'use strict';

const Joi = require('joi');

module.exports = Joi.object().keys({
  smsToken: Joi.string().alphanum().lowercase().length(64)
    .required(),
  mobileNumber: Joi.string().min(3).max(255).required(),
  smsCode: Joi.string().alphanum().lowercase().length(4)
    .required(),
  expiry: Joi.date().timestamp('unix'),
});
