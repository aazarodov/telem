'use strict';

const Joi = require('joi');

module.exports = {
  post: Joi.object().keys({
    login: Joi.string().min(3).max(255).required(),
    password: Joi.string().min(6).max(255).required(),
  }),
};
