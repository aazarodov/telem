'use strict';

const Joi = require('joi');

module.exports = Joi.object().keys({
  _id: Joi.string().uuid({ version: 'uuidv1' }).required(),
  type: Joi.string().valid('supportTitle').required(),
  title: Joi.string().max(255).required(),
});
