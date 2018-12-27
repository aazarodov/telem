'use strict';

const log = require('logger-file-fun-line');
const couch = require('../connection');
const trimId = require('../../utils/trimId');
const prefix = require('../../utils/prefix');

const dbname = prefix('hw_0_ram');

// views: statusesOfAnalysisAndResults

const statusesOfAnalysis = async (pid, _id) => {
  const db = couch.use(dbname);
  const trimedLabAnalysesId = trimId(_id);

  try {
    const labAnalyzesDoc = await db.get(_id);
    if (labAnalyzesDoc.patient.ref !== trimId(pid)) return null;
  } catch (error) {
    if (error.error === 'not_found') return null;
    throw error;
  }
  const response = await db.view('ddoc', 'statusesOfAnalysisAndResults', {
    startkey: [trimedLabAnalysesId],
    endkey: [trimedLabAnalysesId, {}],
    group: true,
  });
  if (!response.rows.length) return null;
  const res = {};
  response.rows.forEach((row) => {
    if (row.key[2] === 0) {
      res[row.value.stringGUID] = {
        status: row.value.status,
        period: row.value.period,
      };
    } else if (res[row.value.stringGUID] && res[row.value.stringGUID].status === 'Готов') {
      res[row.value.stringGUID].result = row.value.result;
    }
  });
  return res;
};

module.exports = statusesOfAnalysis;
