'use strict';

const log = require('logger-file-fun-line');
const unixtimestamp = require('../../../utils/unixtimestamp');
const { encrypt, decrypt } = require('../../../utils/crypto');
const { registerExpiry } = require('../../../../../secrets');

module.exports = {
  post: async (ctx) => {
    const {
      smsToken,
      smsCode,
    } = ctx.state.data;
    let tokenData;
    try {
      tokenData = await decrypt(smsToken);
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: 'smsToken incorrect',
        error,
      };
      return;
    }
    const now = unixtimestamp();
    if (now > tokenData.expiry) {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: 'smsToken expired',
        error: { expiry: tokenData.expiry, now },
      };
      return;
    }
    if (tokenData.smsCode !== smsCode) {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: 'smsCode incorrect',
        error: { mobileNumber: tokenData.mobileNumber, smsCode },
      };
      return;
    }
    ctx.body = {
      status: 'success',
      message: 'smsCode correct',
      data: {
        mobileNumber: tokenData.mobileNumber,
        registerToken: await encrypt({
          mobileNumber: tokenData.mobileNumber,
          expiry: now + registerExpiry,
        }),
        expiry: now + registerExpiry,
      },
    };
  },
  get: async (ctx) => {
    ctx.status = 404;
    ctx.body = {
      status: 'error',
      message: 'try to post /auth/sms/check',
    };
  },
};
