'use strict';

const fetch = require('node-fetch');
const log = require('logger-file-fun-line');
const sms = require('../../../../db/queries/sms');
const unixtimestamp = require('../../../../utils/unixtimestamp');
const { encrypt } = require('../../../../utils/crypto');
const { smsGatewayBaseUrl, smsExpiry } = require('../../../../../../secrets');

const smsGatewaySend = async (phoneNumber, smsCode) => {
  const smsGatewaySendUrl = `${smsGatewayBaseUrl}${phoneNumber}&text=${smsCode}`;
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
    const { phoneNumber } = ctx.state.data;
    if (await sms.existphoneNumber(phoneNumber)) {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: 'sms already sent to this phoneNumber',
        error: { phoneNumber },
      };
      sms.removeExpiredSmsDocs(); // w/o await
      return;
    }
    const smsCode = String(Math.floor(Math.random() * (10000 - 1000)) + 1000);
    if (process.env.NODE_ENV !== 'test') {
      if (await smsGatewaySend(phoneNumber, smsCode) !== 'ok') {
        log('sms send error');
        ctx.status = 400;
        ctx.body = {
          status: 'error',
          message: 'sms send error',
          error: { error: 'gateway error, wrong phoneNumber', phoneNumber },
        };
        sms.removeExpiredSmsDocs(); // w/o await
        return;
      }
    }
    const expiry = unixtimestamp() + smsExpiry;
    const smsToken = await encrypt({ phoneNumber, smsCode, expiry });
    await sms.addSmsDoc({ _id: String(phoneNumber), expiry: Number(expiry) });
    const data = {
      smsToken,
      phoneNumber,
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
