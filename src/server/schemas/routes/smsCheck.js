'use strict';

const Joi = require('joi');

module.exports = Joi.object().keys({
  smsToken: Joi.string().min(16).required(),
  smsCode: Joi.string().alphanum().lowercase().length(4)
    .required(),
});
