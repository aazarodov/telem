'use strict';

const log = require('logger-file-fun-line');
const fetch = require('node-fetch');
const { sendPDFUrl, PDFToken } = require('../../../../../secrets');
const dateTimeFor1C = require('../../../utils/dateTimeFor1C');

module.exports = {
  post: async (ctx) => {
    try {
      const response = await fetch(sendPDFUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: PDFToken,
          barcode: ctx.state.data.barcode,
          email: ctx.state.data.email,
          lastName: ctx.state.data.lastName,
          birthDate: dateTimeFor1C(ctx.state.data.birthDate),
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
