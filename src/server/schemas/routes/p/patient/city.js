'use strict';

const Joi = require('joi');

module.exports = {
  post: Joi.object().keys({
    cityName: Joi.string().required(),
  }),
};
