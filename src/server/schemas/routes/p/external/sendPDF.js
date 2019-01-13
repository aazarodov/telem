'use strict';

const Joi = require('joi');

module.exports = {
  post: Joi.object().keys({
    barcode: Joi.string().required(),
    email: Joi.string().email({ minDomainAtoms: 2 }).required(),
    lastName: Joi.string().max(255).required(),
    birthDate: Joi.date().required(),
  }),
};
