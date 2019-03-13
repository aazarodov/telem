'use strict';

const Joi = require('joi');

module.exports = {
  get: Joi.alternatives([
    Joi.object().keys({
      _id: Joi.string().uuid({ version: 'uuidv1' }).required(),
    }),
    Joi.object().keys({
      limit: Joi.number().positive().default(100),
      bookmark: Joi.string().default(''),
    }),
  ]),
  // put: Joi.object().keys({ // create new
  //   title: Joi.string().max(255).required(),
  //   meta: Joi.object().default({}),
  //   firstMessage: Joi.object().keys({
  //     sendDate: Joi.date().required(),
  //     meta: Joi.object().default({}),
  //     text: Joi.string().max(4096).required(),
  //   }).required(),
  // }),
};
