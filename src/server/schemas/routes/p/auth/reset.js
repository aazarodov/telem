'use strict';

const Joi = require('joi');

module.exports = {
  post: Joi.object().keys({
    password: Joi.string().min(6).max(255).required(),
    registerToken: Joi.string().min(16).required(),
  }),
};
