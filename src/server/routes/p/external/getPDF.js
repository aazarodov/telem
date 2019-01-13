'use strict';

const log = require('logger-file-fun-line');
const fetch = require('node-fetch');
const { getPDFUrl, PDFToken } = require('../../../../../secrets');
const dateTimeFor1C = require('../../../utils/dateTimeFor1C');

module.exports = {
  get: async (ctx) => {
    try {
      const response = await fetch(getPDFUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: PDFToken,
          barcode: ctx.state.data.barcode,
          lastName: ctx.state.data.lastName,
          birthDate: dateTimeFor1C(ctx.state.data.birthDate),
        }),
      });
      if (response.headers.get('content-type') === 'application/pdf') {
        ctx.set('content-type', response.headers.get('content-type'));
        ctx.set('content-length', response.headers.get('content-length'));
        ctx.body = response.body;
      } else {
        ctx.status = 400;
        ctx.body = {
          status: 'error',
          message: 'getPDF error',
          error: await response.text(),
        };
      }
    } catch (error) {
      log(error);
      ctx.status = 500;
      ctx.body = {
        status: 'error',
        message: 'getPDF error',
        error,
      };
    }
  },
};
