'use strict';

const Joi = require('joi');

module.exports = {
  get: Joi.object().keys({
    chatId: Joi.string().uuid({ version: 'uuidv1' }).required(),
    limit: Joi.number().positive().default(100),
    bookmark: Joi.string().default(''),
  }),
};
