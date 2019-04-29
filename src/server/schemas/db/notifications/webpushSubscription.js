'use strict';

const Joi = require('joi');

const catPatientsRegExp = new RegExp('^cat\\.patients\\|[a-f0-9]{8}-[a-f0-9]{4}-1[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$');

module.exports = Joi.object().keys({
  _id: Joi.string().uuid({ version: 'uuidv1' }).required(),
  type: Joi.string().valid('webpushSubscription').required(),
  pid: Joi.string().regex(catPatientsRegExp, 'cat.patients|uuidv1').required(),
  userAgent: Joi.string().max(256).required(),
  subscription: Joi.object().keys({
    endpoint: Joi.string().uri({ scheme: 'https' }).required(),
    expirationTime: Joi.date().allow(null),
    options: Joi.date().allow(null),
    subscriptionId: Joi.string(),
    keys: Joi.object().keys({
      p256dh: Joi.string().required(),
      auth: Joi.string().required(),
    }).required(),
  }).required(),
});
