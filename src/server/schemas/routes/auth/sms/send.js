'use strict';

const Joi = require('joi');

module.exports = {
  post: Joi.object().keys({
    mobileNumber: Joi.string().regex(/^7[0-9]{5,15}$/, '7xxxxx mobileNumber').required(),
  }),
};
