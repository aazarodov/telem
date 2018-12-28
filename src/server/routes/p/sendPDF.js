'use strict';

const log = require('logger-file-fun-line');
const fetch = require('node-fetch');
const { sendPDFUrl, sendPDFToken } = require('../../../../secrets');

module.exports = {
  post: async (ctx) => {
    // TODO test access to barcode
    // bool patients.barcodeTest(_id, barcode)
    try {
      const response = await fetch(sendPDFUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: sendPDFToken,
          barcode: ctx.state.data.barcode,
        }),
      });
      const responseText = await response.text();
      if (responseText === 'Письмо успешно отправлено') {
        ctx.body = {
          status: 'success',
          message: 'PDF sent to email',
        };
      } else {
        ctx.status = 400;
        ctx.body = {
          status: 'error',
          message: 'sendPDF error',
          error: responseText,
        };
      }
    } catch (error) {
      log(error);
      ctx.status = 500;
      ctx.body = {
        status: 'error',
        message: 'sendPDF error',
        error,
      };
    }
  },
};
