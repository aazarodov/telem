'use strict';

const log = require('logger-file-fun-line');
const fetch = require('node-fetch');
const { getPDFUrl, PDFToken } = require('../../../../secrets');

module.exports = {
  get: async (ctx) => {
    // TODO test access to barcode
    // bool patients.barcodeTest(_id, barcode)
    try {
      const response = await fetch(getPDFUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: PDFToken,
          barcode: ctx.state.data.barcode,
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
