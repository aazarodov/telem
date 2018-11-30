'use strict';

const Joi = require('joi');

const name = 'kindsOfContactInformation';
const className = `cat.${name}`;
const idRegExp = new RegExp(`^cat\\.${name}\\|[a-f0-9]{8}-[a-f0-9]{4}-1[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$`);
const typeName = 'enm.typesOfContactInformation';

module.exports = Joi.object().keys({
  _id: Joi.string().regex(idRegExp, `${className}|uuidv1`).required(),
  name: Joi.string().valid([
    'Телефон',
    'Skype',
    'Сайт',
    'Юр. адрес',
    'Факс',
    'Другое',
    'Почтовый адрес',
    'Доставка',
    'Факт. адрес',
    'E-mail',
    'Телефон представителя',
  ]).required(),
  type: Joi.object().keys({
    name: Joi.string().valid([
      'Телефон',
      'Skype',
      'ВебСтраница',
      'Адрес',
      'Факс',
      'Другое',
      'АдресЭлектроннойПочты',
    ]).required(),
    presentation: Joi.string().valid([
      'Телефон',
      'Skype',
      'Веб страница',
      'Адрес',
      'Факс',
      'Другое',
      'Адрес электронной почты',
    ]).required(),
    type: typeName,
  }),
  class_name: Joi.string().valid(className).required(),
});
