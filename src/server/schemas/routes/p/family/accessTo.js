'use strict';

const Joi = require('joi');

module.exports = {
  put: Joi.object().keys({
    phoneNumber: Joi.string().regex(/^7[0-9]{5,15}$/, '7xxxxx phoneNumber').required(),
    lastName: Joi.string().min(2).max(255).required(),
    firstName: Joi.string().min(2).max(255).required(),
    middleName: Joi.string().min(2).max(255).required(),
    birthDate: Joi.date().required(),
    relation: Joi.any().valid(['Ребенок', 'Родитель', 'Супруг', 'Другая']).required(),
    access: Joi.bool().required(),
  }),
  post: Joi.object().keys({
    ref: Joi.string().uuid({ version: 'uuidv1' }).required(),
    relation: Joi.any().valid(['Ребенок', 'Родитель', 'Супруг', 'Другая']),
    access: Joi.bool(),
  }),
  delete: Joi.object().keys({
    ref: Joi.string().uuid({ version: 'uuidv1' }).required(),
  }),
};
