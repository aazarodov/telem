'use strict';

const Joi = require('joi');

module.exports = Joi.object().keys({
  smsToken: Joi.string().min(16).required(),
  mobileNumber: Joi.string().min(3).max(255), // TODO remove this field
  smsCode: Joi.string().alphanum().lowercase().length(4)
    .required(),
  expiry: Joi.date().timestamp('unix'), // TODO remove this field
});
