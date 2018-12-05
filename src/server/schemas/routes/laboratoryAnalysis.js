'use strict';

const Joi = require('joi');

module.exports = {
  get: Joi.object().keys({
    _id: Joi.string().uuid({ version: 'uuidv1' }),
  }),
};
