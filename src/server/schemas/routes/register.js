'use strict';

const Joi = require('joi');

module.exports = Joi.object().keys({
  mobileNumber: Joi.string().min(3).max(255).required(),
  email: Joi.string().email({ minDomainAtoms: 2 }).required(),
  password: Joi.string().min(6).max(255).required(),
  surname: Joi.string().min(2).max(255).required(),
  firstName: Joi.string().min(2).max(255).required(),
  patronymic: Joi.string().min(2).max(255).required(),
  sex: Joi.any().valid(['Мужской', 'Женский']).required(),
  birthDate: Joi.date().required(),
  registerToken: Joi.string().alphanum().lowercase().length(64)
    .required(),
  expiry: Joi.date().timestamp('unix'),
});
