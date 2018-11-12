'use strict';

const Joi = require('joi');

module.exports = Joi.object().keys({
  phone_numbers: Joi.string().min(3).max(255).required(),
  email: Joi.string().email({ minDomainAtoms: 2 }).required(),
  Password: Joi.string().min(6).max(255).required(),
  Surname: Joi.string().min(2).max(255).required(),
  FirstName: Joi.string().min(2).max(255).required(),
  Patronymic: Joi.string().min(2).max(255).required(),
  sex: Joi.any().valid(['Мужской', 'Женский']).required(),
  birth_date: Joi.date().required(),
});
