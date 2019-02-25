'use strict';

const Joi = require('joi');

module.exports = {
  post: Joi.object().keys({
    fileId: Joi.string().uuid({ version: 'uuidv1' }).required(),
  }),
  delete: Joi.object().keys({
  }),
};
