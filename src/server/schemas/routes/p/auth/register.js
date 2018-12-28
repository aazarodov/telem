'use strict';

const Joi = require('joi');

module.exports = {
  post: Joi.object().keys({
    email: Joi.string().email({ minDomainAtoms: 2 }).required(),
    password: Joi.string().min(6).max(255).required(),
    lastName: Joi.string().min(2).max(255).required(),
    firstName: Joi.string().min(2).max(255).required(),
    middleName: Joi.string().min(2).max(255).required(),
    sex: Joi.any().valid(['Мужской', 'Женский']).required(),
    birthDate: Joi.date().required(),
    registerToken: Joi.string().min(16).required(),
    agreementOfSendingOtherInformation: Joi.bool().required(),
    agreementOfSendingResults: Joi.bool().required(),
  }),
};
