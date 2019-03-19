'use strict';

const Joi = require('joi');

const docAppointmentRegExp = new RegExp('^doc\\.appointment\\|[a-f0-9]{8}-[a-f0-9]{4}-1[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$');

module.exports = {
  get: Joi.alternatives([
    Joi.object().keys({
      _id: Joi.string().regex(docAppointmentRegExp, 'doc.appointment|uuidv1').required(),
    }),
    Joi.object().keys({ // sort by beginOfAppointment asc (less/earliest/youngest first)
      beginOfAppointmentDateGTE: Joi.date().allow('').default(''), // greater than or equal
      beginOfAppointmentDateLT: Joi.date().allow('infinity').default('infinity'), // less than
      limit: Joi.number().positive().default(100),
      bookmark: Joi.string().default(''),
    }),
  ]),
};
