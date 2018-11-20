'use strict';

const log = require('logger-file-fun-line');
const smsCheckSchema = require('../../../schemas/routes/smsCheck');
const unixtimestamp = require('../../../utils/unixtimestamp');
const { encrypt, decrypt } = require('../../../utils/token');
const { registerExpiry } = require('../../../../../secrets');

module.exports = {
  '/': {
    post: async (ctx) => {
      try {
        await smsCheckSchema.validate(ctx.request.body);
      } catch (error) {
        ctx.status = 400;
        ctx.body = {
          status: 'error',
          message: 'validate error',
          error: { message: error.message, body: ctx.request.body },
        };
        return;
      }
      const {
        smsToken,
        smsCode,
      } = ctx.request.body;
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
      if (now >= tokenData.expiry) {
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
  },
};
