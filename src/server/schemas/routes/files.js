'use strict';

const Joi = require('joi');

module.exports = {
  put: Joi.object().keys({
    name: Joi.string().max(255).required(),
    comment: Joi.string().max(255).default(''),
  }),
  get: Joi.alternatives([
    Joi.object().keys({
      _id: Joi.string().uuid({ version: 'uuidv1' }),
    }),
    Joi.object().keys({
      limit: Joi.number().positive().default(100),
      bookmark: Joi.string().default(''),
    }),
  ]),
  post: Joi.object().keys({
    _id: Joi.string().uuid({ version: 'uuidv1' }).required(),
    name: Joi.string().max(255),
    comment: Joi.string().max(255),
  }).or('name', 'comment'),
  delete: Joi.object().keys({
    _id: Joi.string().uuid({ version: 'uuidv1' }).required(),
  }),
};
