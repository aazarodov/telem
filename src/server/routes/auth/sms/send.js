'use strict';

const fetch = require('node-fetch');
const log = require('logger-file-fun-line');
const sms = require('../../../db/queries/sms');
const unixtimestamp = require('../../../utils/unixtimestamp');
const { encrypt } = require('../../../utils/crypto');
const { smsGatewayBaseUrl, smsExpiry } = require('../../../../../secrets');

const smsGatewaySend = async (mobileNumber, smsCode) => {
  const smsGatewaySendUrl = `${smsGatewayBaseUrl}${mobileNumber}&text=${smsCode}`;
  log(smsGatewaySendUrl);
  const smsGatewayResponse = await fetch(smsGatewaySendUrl);
  const smsGatewayResponseText = await smsGatewayResponse.text();
  log(smsGatewayResponseText);
  const smsGatewayResponseInt = Number(smsGatewayResponseText.slice(0, smsGatewayResponseText.indexOf(',')));
  if (Number.isNaN(smsGatewayResponseInt) || smsGatewayResponseInt <= 0) {
    return 'error';
  }
  return 'ok';
};


module.exports = {
  post: async (ctx) => {
    const { mobileNumber } = ctx.state.data;
    if (await sms.existMobileNumber(mobileNumber)) {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: 'sms already sent to this mobileNumber',
        error: { mobileNumber },
      };
      sms.removeExpiredSmsDocs(); // w/o await
      return;
    }
    const smsCode = String(Math.floor(Math.random() * (10000 - 1000)) + 1000);
    if (process.env.NODE_ENV !== 'test') {
      if (await smsGatewaySend(mobileNumber, smsCode) !== 'ok') {
        log('sms send error');
        ctx.status = 400;
        ctx.body = {
          status: 'error',
          message: 'sms send error',
          error: { error: 'gateway error, wrong mobileNumber', mobileNumber },
        };
        sms.removeExpiredSmsDocs(); // w/o await
        return;
      }
    }
    const expiry = unixtimestamp() + smsExpiry;
    const smsToken = await encrypt({ mobileNumber, smsCode, expiry });
    await sms.addSmsDoc({ _id: String(mobileNumber), expiry: Number(expiry) });
    const data = {
      smsToken,
      mobileNumber,
      expiry,
    };
    ctx.body = {
      status: 'success',
      message: 'sms successfully sent',
      data,
    };
    sms.removeExpiredSmsDocs(); // w/o await
  },
  get: async (ctx) => {
    ctx.status = 404;
    ctx.body = {
      status: 'error',
      message: 'try to post /auth/sms/send',
    };
  },
};
