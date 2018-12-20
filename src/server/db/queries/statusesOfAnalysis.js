'use strict';

const log = require('logger-file-fun-line');
const couch = require('../connection');
const trimId = require('../../utils/trimId');
const prefix = require('../../utils/prefix');

const dbname = prefix('hw_0_ram');

// views: statusesOfAnalysis

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

  const response = await db.view('ddoc', 'statusesOfAnalysis', {
    startkey: [trimedLabAnalysesId],
    endkey: [trimedLabAnalysesId, {}],
    group: true,
  });
  if (!response.rows.length) return null;
  const res = {};
  const findPromises = response.rows.map(async (row) => {
    res[row.value.stringGUID] = {
      status: row.value.status,
      period: row.value.period,
    };
    if (row.value.status === 'Готов') {
      const result = await db.find({
        selector: {
          class_name: 'ireg.resultsOfAnalysis',
          stringGUID: row.value.stringGUID,
        },
      });
      if (result.docs[0]) {
        res[row.value.stringGUID].result = result.docs[0].result;
      }
    }
  });
  await Promise.all(findPromises);
  return res;
};

module.exports = statusesOfAnalysis;
