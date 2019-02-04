'use strict';

const Joi = require('joi');

module.exports = {
  post: Joi.object().keys({
    lastName: Joi.string().min(2).max(255).required(),
    firstName: Joi.string().min(2).max(255).required(),
    middleName: Joi.string().min(2).max(255).required(),
    sex: Joi.any().valid(['Мужской', 'Женский']).required(),
    birthDate: Joi.date().required(),
    agreementOfSendingOtherInformation: Joi.bool().required(),
    agreementOfSendingResults: Joi.bool().required(),
    relation: Joi.any().valid(['Ребенок', 'Родитель', 'Супруг', 'Другая']).required(),
  }),
};
