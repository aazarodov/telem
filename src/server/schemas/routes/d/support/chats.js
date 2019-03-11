'use strict';

const Joi = require('joi');

module.exports = {
  get: Joi.alternatives([
    Joi.object().keys({
      _id: Joi.string().uuid({ version: 'uuidv1' }).required(),
    }),
    Joi.object().keys({
      titles: Joi.array().min(1).items(Joi.string().max(255).required()).required(),
      new: Joi.bool().required(),
      closed: Joi.bool().required(),
      limit: Joi.number().positive().default(100),
      bookmark: Joi.string().default(''),
    }),
  ]),
  put: Joi.object().keys({ // take new chat
    _id: Joi.string().uuid({ version: 'uuidv1' }).required(),
  }),
  post: Joi.object().keys({ // close chat by operator
    _id: Joi.string().uuid({ version: 'uuidv1' }).required(),
  }),
};
