'use strict';

const Joi = require('joi');

module.exports = Joi.object().keys({
  _id: Joi.string().uuid({ version: 'uuidv1' }).required(),
  deliveredDate: Joi.date().required(),
});
