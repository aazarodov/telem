'use strict';

const Joi = require('joi');

module.exports = {
  post: Joi.object().keys({
    accessToken: Joi.string().min(3).max(255).required(),
  }),
};
