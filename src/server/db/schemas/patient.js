'use strict';

const Joi = require('joi');

module.exports = Joi.object().keys({
  phone_numbers: Joi.string().min(3).max(255).required(),
  email: Joi.string().email({ minDomainAtoms: 2 }).required(),
  name: Joi.string().min(3).max(255).required(),
  Password: Joi.string().alphanum().length(64).required(),
  Surname: Joi.string().min(3).max(255).required(),
  FirstName: Joi.string().min(3).max(255).required(),
  Patronymic: Joi.string().allow('').min(3).max(255),
  sex: Joi.object().keys({
    name: Joi.any().valid(['Мужской', 'Женский']).required(),
    presentation: Joi.any().valid(['Мужской', 'Женский']).required(),
    type: Joi.any().valid('enm.ПолФизическогоЛица').required(),
  }),
  birth_date: Joi.date().required(),
  note: Joi.string().allow('').max(2048),
  status: Joi.any().valid([
    'Не создан', // не заходил в ЛК
    'Не активирован, требуется модерация', // расхождение между данными, дата регистрации и расходящиеся данные в note
    'Активен', // прошел регистрацию и активирован администратором
    'Удален',
    'Заблокинован',
    'требуется модерация', // все данные совпадают, дата регистрации в note
    'Создан, требуется модерация', // новый пациент, отсутствующий в бд, Дата регистрации в note?
  ]).required(),
  class_name: Joi.any().valid('cat.Patients').required(),
});
