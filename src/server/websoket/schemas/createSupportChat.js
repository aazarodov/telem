'use strict';

const Joi = require('joi');

module.exports = Joi.object().keys({
  title: Joi.string().max(256).required(),
  meta: Joi.object().default({}),
  firstMessage: Joi.object().keys({
    sendDate: Joi.date().required(),
    meta: Joi.object().default({}),
    text: Joi.string().max(4096).required(),
  }).required(),
});
