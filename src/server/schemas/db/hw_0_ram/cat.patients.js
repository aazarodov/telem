'use strict';

const Joi = require('joi');

const name = 'patients';
const className = `cat.${name}`;
const idRegExp = new RegExp(`^cat\\.${name}\\|[a-f0-9]{8}-[a-f0-9]{4}-1[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$`);

module.exports = Joi.object().keys({
  _id: Joi.string().regex(idRegExp, `${className}|uuidv1`).required(),
  name: Joi.string().max(255).required(),
  lastName: Joi.string().max(255).required(),
  firstName: Joi.string().max(255).required(),
  middleName: Joi.string().allow('').max(255),
  sex: Joi.object().keys({
    name: Joi.string().valid(['Мужской', 'Женский']).required(),
    presentation: Joi.string().valid(['Мужской', 'Женский']).required(),
    type: Joi.string().valid('enm.typesOfSex').required(),
  }),
  birthDate: Joi.string().length(19).required(),
  groupOfBlood: Joi.object().keys({
    name: Joi.string().max(255).required(),
    presentation: Joi.string().max(255).required(),
    type: Joi.string().valid('enm.groupsOfBlood').required(),
  }),
  groupOfHealthy: Joi.object().keys({
    ref: Joi.string().uuid({ version: 'uuidv1' }).required(),
    presentation: Joi.string().max(255).required(),
    type: Joi.string().valid('cat.groupsOfHealthy').required(),
  }),
  agreementOfSendingOtherInformation: Joi.bool().required(),
  agreementOfSendingResults: Joi.bool().required(),
  status: Joi.object().keys({
    ref: Joi.string().uuid({ version: 'uuidv1' }).required(),
    presentation: Joi.string().valid([
      'Не создан',
      'Не активирован',
      'Активен',
      'Удален',
      'Заблокинован',
      'Новый',
    ]).required(),
    type: Joi.string().valid('cat.patientStatuses').required(),
  }).required(),
  note: Joi.string().allow('').max(2048),
  password: Joi.string().allow('').length(44).required(),
  city: Joi.object().keys({
    ref: Joi.string().uuid({ version: 'uuidv1' }).required(),
    presentation: Joi.string().required(),
    type: Joi.string().valid('cat.cities').required(),
  }),
  contactInformation: Joi.array().items(
    Joi.object().keys({
      type: {
        name: Joi.string().valid('Телефон').required(),
        presentation: Joi.string().valid('Телефон').required(),
        type: Joi.string().valid('enm.typesOfContactInformation').required(),
      },
      kind: {
        ref: Joi.string().uuid({ version: 'uuidv1' }).required(),
        presentation: Joi.string().valid('Телефон').required(),
        type: Joi.string().valid('cat.kindsOfContactInformation').required(),
      },
      presentation: Joi.string().max(15).required(),
      fieldValues: Joi.string().required(),
      country: Joi.string().valid('').required(),
      region: Joi.string().valid('').required(),
      city: Joi.string().valid('').required(),
      emailAddress: Joi.string().valid('').required(),
      phoneNumber: Joi.string().max(15).required(),
      phoneNumberWithoutCodes: Joi.string().valid('').required(),
    }).required(),
    Joi.object().keys({
      type: {
        name: Joi.string().valid('АдресЭлектроннойПочты').required(),
        presentation: Joi.string().valid('Адрес электронной почты').required(),
        type: Joi.string().valid('enm.typesOfContactInformation').required(),
      },
      kind: {
        ref: Joi.string().uuid({ version: 'uuidv1' }).required(),
        presentation: Joi.string().valid('E-mail').required(),
        type: Joi.string().valid('cat.kindsOfContactInformation').required(),
      },
      presentation: Joi.string().email({ minDomainAtoms: 2 }).required(),
      fieldValues: Joi.string().required(),
      country: Joi.string().valid('').required(),
      region: Joi.string().valid('').required(),
      city: Joi.string().valid('').required(),
      emailAddress: Joi.string().email({ minDomainAtoms: 2 }).required(),
      phoneNumber: Joi.string().valid('').required(),
      phoneNumberWithoutCodes: Joi.string().valid('').required(),
    }).required(),
    Joi.object().keys({
      type: {
        name: Joi.string().valid('Телефон').required(),
        presentation: Joi.string().valid('Телефон').required(),
        type: Joi.string().valid('enm.typesOfContactInformation').required(),
      },
      kind: {
        ref: Joi.string().uuid({ version: 'uuidv1' }).required(),
        presentation: Joi.string().valid('Телефон представителя').required(),
        type: Joi.string().valid('cat.kindsOfContactInformation').required(),
      },
      presentation: Joi.string().max(15).required(),
      fieldValues: Joi.string().required(),
      country: Joi.string().valid('').required(),
      region: Joi.string().valid('').required(),
      city: Joi.string().valid('').required(),
      emailAddress: Joi.string().valid('').required(),
      phoneNumber: Joi.string().max(15).required(),
      phoneNumberWithoutCodes: Joi.string().valid('').required(),
    }),
    Joi.object().keys({
      type: {
        name: Joi.string().valid('Адрес').required(),
        presentation: Joi.string().valid('Адрес').required(),
        type: Joi.string().valid('enm.typesOfContactInformation').required(),
      },
      kind: {
        ref: Joi.string().uuid({ version: 'uuidv1' }).required(),
        presentation: Joi.string().valid('Факт. адрес').required(),
        type: Joi.string().valid('cat.kindsOfContactInformation').required(),
      },
      presentation: Joi.string().max(1024).required(),
      fieldValues: Joi.string().required(),
      country: Joi.string().allow('').max(255).required(),
      region: Joi.string().allow('').max(255).required(),
      city: Joi.string().allow('').max(255).required(),
      emailAddress: Joi.string().valid('').required(),
      phoneNumber: Joi.string().valid('').required(),
      phoneNumberWithoutCodes: Joi.string().valid('').required(),
    }),
  ),
  class_name: Joi.string().valid(className).required(),
});
