'use strict';

const Joi = require('joi');

module.exports = {
  post: Joi.object().keys({
    smsToken: Joi.string().min(16).required(),
    smsCode: Joi.string().alphanum().lowercase().length(4).required(),
  }),
};
