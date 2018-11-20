'use strict';

const Joi = require('joi');

module.exports = Joi.object().keys({
  mobileNumber: Joi.string().min(3).max(255).required(),
  email: Joi.string().email({ minDomainAtoms: 2 }).required(),
  name: Joi.string().min(3).max(255).required(),
  password: Joi.string().length(44).required(),
  surname: Joi.string().min(3).max(255).required(),
  firstName: Joi.string().min(3).max(255).required(),
  patronymic: Joi.string().allow('').min(3).max(255),
  sex: Joi.object().keys({
    name: Joi.any().valid(['Мужской', 'Женский']).required(),
    presentation: Joi.any().valid(['Мужской', 'Женский']).required(),
    type: Joi.any().valid('enm.ПолФизическогоЛица').required(),
  }),
  birthDate: Joi.string().length(19).required(),
  note: Joi.string().allow('').max(2048),
  status: Joi.object().keys({
    ref: Joi.any().valid('822eeaa8-e57e-11e8-80de-f69a0bcb2acf').required(),
    presentation: Joi.any().valid([
      'Не создан',
      'Не активирован',
      'Активен',
      'Удален',
      'Заблокинован',
    ]).required(),
    type: Joi.any().valid('cat.patientStatus').required(),
  }),
  class_name: Joi.any().valid('cat.patients').required(),
});
