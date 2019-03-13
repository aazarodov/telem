'use strict';

const Joi = require('joi');

module.exports = Joi.object().keys({
  supportTitles: Joi.array().items(Joi.string().max(256).required()).required(),
});
