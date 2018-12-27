'use strict';

const Joi = require('joi');

module.exports = {
  post: Joi.object().keys({
    agreementOfSendingOtherInformation: Joi.bool(),
    agreementOfSendingResults: Joi.bool(),
  }).or('agreementOfSendingOtherInformation', 'agreementOfSendingResults'),
};
