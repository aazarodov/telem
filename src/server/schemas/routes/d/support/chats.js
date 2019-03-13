'use strict';

const Joi = require('joi');

module.exports = {
  get: Joi.alternatives([
    Joi.object().keys({
      _id: Joi.string().uuid({ version: 'uuidv1' }).required(),
    }),
    Joi.object().keys({
      titles: Joi.array().items(Joi.string().valid([
        'Запись на прием',
        'Лабораторные анализы',
        'Медицинские услуги',
        'Другие вопросы',
      ]).required()).required(),
      new: Joi.bool().required(),
      closed: Joi.bool().required(),
      limit: Joi.number().positive().default(100),
      bookmark: Joi.string().default(''),
    }),
  ]),
  // put: Joi.object().keys({ // take new chat
  //   _id: Joi.string().uuid({ version: 'uuidv1' }).required(),
  // }),
};
