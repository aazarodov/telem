'use strict';

const Joi = require('joi');

module.exports = {
  get: Joi.object().keys({
    specialist: Joi.string().uuid({ version: 'uuidv1' }).required(),
    company: Joi.string().uuid({ version: 'uuidv1' }).required(),
    dateGTE: Joi.date().required(), // greater than or equal
    dateLT: Joi.date().required(), // less than
  }),
};
