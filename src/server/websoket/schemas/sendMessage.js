'use strict';

const Joi = require('joi');

module.exports = Joi.object().keys({
  chatId: Joi.string().uuid({ version: 'uuidv1' }).required(),
  type: Joi.string().valid('supportMessage').required(),
  sendDate: Joi.date().required(),
  meta: Joi.object().default({}),
  text: Joi.string().max(4096).required(),
});
