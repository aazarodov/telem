'use strict';

const Joi = require('joi');

module.exports = {
  post: Joi.object().keys({
    meta: Joi.object().allow('').required(),
  }),
};
