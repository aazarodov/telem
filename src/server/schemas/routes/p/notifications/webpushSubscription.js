'use strict';

const Joi = require('joi');

module.exports = {
  get: Joi.alternatives([
    Joi.object().keys({
      _id: Joi.string().uuid({ version: 'uuidv1' }).required(),
    }),
    Joi.object().keys({
      limit: Joi.number().positive().default(100),
      bookmark: Joi.string().default(''),
    }),
  ]),
  post: Joi.object().keys({
    endpoint: Joi.string().uri({ scheme: 'https' }).required(),
    expirationTime: Joi.date().allow(null),
    options: Joi.date().allow(null),
    subscriptionId: Joi.string(),
    keys: Joi.object().keys({
      p256dh: Joi.string().required(),
      auth: Joi.string().required(),
    }).required(),
  }),
  delete: Joi.object().keys({
    _id: Joi.string().uuid({ version: 'uuidv1' }).required(),
  }),
};
