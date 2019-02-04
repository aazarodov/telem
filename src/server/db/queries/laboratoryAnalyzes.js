'use strict';

const log = require('logger-file-fun-line');
const couch = require('../connection');
const trimId = require('../../utils/trimId');
const prefix = require('../../utils/prefix');

const dbname = prefix('hw_0_ram');
const db = couch.use(dbname);

// indexes: class_name,patient.ref

const labAnalyzesAndResultsMap = (response) => {
  const newResponse = {};
  newResponse.docs = [];
  newResponse.bookmark = response.bookmark;
  response.docs.forEach((docOrIreg) => {
    if (docOrIreg.class_name === 'ireg.approvedResults') {
      const labAnalys = response.docs.find(doc => doc._id === `doc.laboratoryAnalyzes|${docOrIreg.document.ref}`);
      if (labAnalys) {
        docOrIreg.records.forEach((rec) => {
          const analys = labAnalys.analyzes.find(an => an.stringGUID === rec.stringGUID);
          if (analys) {
            analys.result = rec.result.presentation ? rec.result.presentation : rec.result;
            analys.approvalDateResult = rec.approvalDateResult;
            if (!labAnalys.PDFAvailable) labAnalys.PDFAvailable = true;
          }
        });
      }
    } else if (docOrIreg.class_name === 'doc.laboratoryAnalyzes') {
      docOrIreg.PDFAvailable = !!docOrIreg.PDFAvailable; // eslint-disable-line no-param-reassign
      newResponse.docs.push(docOrIreg);
    }
  });
  return newResponse;
};

module.exports = {
  async list(pid, limit, bookmark) {
    const response = await db.find({
      selector: {
        class_name: { $or: ['doc.laboratoryAnalyzes', 'ireg.approvedResults'] },
        'patient.ref': trimId(pid),
      },
      use_index: ['indexes', 'class_name,patient.ref'],
      // TODO separate queries: first with limit, second with ids (startKey, endKey)
      limit: limit * 2,
      bookmark,
    });
    return labAnalyzesAndResultsMap(response);
  },
  async getById(pid, _id) {
    const response = await db.find({
      selector: {
        _id: { $or: [_id, `ireg.approvedResults|${trimId(_id)}¶${trimId(pid)}`] },
        'patient.ref': trimId(pid),
      },
      limit: 2,
    });
    return labAnalyzesAndResultsMap(response).docs[0];
  },
};
