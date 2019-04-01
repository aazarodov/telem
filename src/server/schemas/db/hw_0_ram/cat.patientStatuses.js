'use strict';

const Joi = require('joi');

const name = 'patientStatuses';
const className = `cat.${name}`;
const idRegExp = new RegExp(`^cat\\.${name}\\|[a-f0-9]{8}-[a-f0-9]{4}-1[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$`);

module.exports = Joi.object().keys({
  _id: Joi.string().regex(idRegExp, `${className}|uuidv1`).required(),
  name: Joi.string().valid([
    'Не создан',
    'Не активирован',
    'Активен',
    'Удален',
    'Заблокирован',
    'Новый',
    'Не верифицирован',
  ]).required(),
  class_name: Joi.string().valid(className).required(),
});
