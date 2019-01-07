'use strict';

const Joi = require('joi');

const docLaboratoryAnalyzesRegExp = new RegExp('^doc\\.laboratoryAnalyzes\\|[a-f0-9]{8}-[a-f0-9]{4}-1[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$');

module.exports = {
  get: Joi.object().keys({
    _id: Joi.string().regex(docLaboratoryAnalyzesRegExp, 'doc.laboratoryAnalyzes|uuidv1').required(),
  }),
};
