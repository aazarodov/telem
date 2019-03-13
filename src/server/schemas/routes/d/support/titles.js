'use strict';

const Joi = require('joi');

module.exports = {
  get: Joi.object().keys({
    limit: Joi.number().positive().default(100),
    bookmark: Joi.string().default(''),
  }),
  // post: Joi.object().keys({ // take new chat
  //   supportTitles: Joi.array().items(Joi.string().valid([
  //     'Запись на прием',
  //     'Лабораторные анализы',
  //     'Медицинские услуги',
  //     'Другие вопросы',
  //   ]).required()).required(),
  // }),
};
