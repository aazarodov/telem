'use strict';

const fetch = require('node-fetch');
const log = require('logger-file-fun-line');
const smsSendSchema = require('../../../schemas/routes/smsSend');
const sms = require('../../../db/queries/sms');
const unixtimestamp = require('../../../utils/unixtimestamp');
const getSmsToken = require('../../../utils/smsToken');
const { smsGatewayBaseUrl, smsExpiry, smsCodeSendOnResponce } = require('../../../../../secrets');

module.exports = {
  '/': {
    post: async (ctx) => {
      try {
        await smsSendSchema.validate(ctx.request.body);
      } catch (error) {
        ctx.status = 400;
        ctx.body = {
          status: 'error',
          message: 'validate error',
          error: { message: error.message, body: ctx.request.body },
        };
        return;
      }
      const { mobileNumber } = ctx.request.body;
      const testMobileNumberInt = await sms.testMobileNumber(mobileNumber);
      if (testMobileNumberInt) {
        ctx.status = 400;
        ctx.body = {
          status: 'error',
          message: 'sms already sent to this mobileNumber',
          error: { expiry: testMobileNumberInt, mobileNumber },
        };
        return;
      }
      const smsCode = String(Math.floor(Math.random() * (10000 - 1000)) + 1000);
      if (process.env.NODE_ENV !== 'test') {
        const smsGatewaySendUrl = `${smsGatewayBaseUrl}${mobileNumber}&text=${smsCode}`;
        log(smsGatewaySendUrl);
        const smsGatewayResponse = await fetch(smsGatewaySendUrl);
        const smsGatewayResponseText = await smsGatewayResponse.text();
        log(smsGatewayResponseText);
        const smsGatewayResponseInt = Number(smsGatewayResponseText.slice(0, smsGatewayResponseText.indexOf(',')));
        if (!Number.isInteger(smsGatewayResponseInt) || smsGatewayResponseInt <= 0) {
          ctx.status = 400;
          ctx.body = {
            status: 'error',
            message: 'sms send error',
            error: { error: 'gateway error maybe wrong mobileNumber', mobileNumber, smsGatewayResponseText },
          };
          return;
        }
      }
      const expiry = unixtimestamp() + smsExpiry;
      const newSmsRecord = {
        smsToken: await getSmsToken(mobileNumber, expiry),
        mobileNumber,
        smsCode,
        expiry,
      };
      await sms.addSmsCode(newSmsRecord);
      if (!smsCodeSendOnResponce) {
        delete newSmsRecord.smsCode;
      }
      ctx.body = {
        status: 'success',
        message: 'sms successfully sent',
        data: newSmsRecord,
      };
    },
    get: async (ctx) => {
      ctx.status = 404;
      ctx.body = {
        status: 'error',
        message: 'try to post /auth/sms/send',
      };
    },
  },
};
