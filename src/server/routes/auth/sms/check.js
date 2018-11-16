'use strict';

const log = require('logger-file-fun-line');
const smsCheckSchema = require('../../../schemas/routes/smsCheck');
const sms = require('../../../db/queries/sms');
const unixtimestamp = require('../../../utils/unixtimestamp');
const getSmsToken = require('../../../utils/smsToken');
const getRegisterToken = require('../../../utils/registerToken');
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
        mobileNumber,
        smsCode,
        expiry,
      } = ctx.request.body;
      const now = unixtimestamp();
      if (now >= expiry) {
        ctx.status = 400;
        ctx.body = {
          status: 'error',
          message: 'smsToken expired',
          error: { expiry, now },
        };
        return;
      }
      const smsTokenForCheck = await getSmsToken(mobileNumber, expiry);
      if (smsTokenForCheck !== smsToken) {
        ctx.status = 400;
        ctx.body = {
          status: 'error',
          message: 'smsToken incorrect',
          error: { expiry, now },
        };
        return;
      }
      const testSmsCodeBool = await sms.testSmsCode(smsToken, smsCode);
      if (!testSmsCodeBool) {
        ctx.status = 400;
        ctx.body = {
          status: 'error',
          message: 'smsCode incorrect',
          error: { mobileNumber, smsCode },
        };
        return;
      }
      ctx.body = {
        status: 'success',
        message: 'smsCode correct',
        data: {
          mobileNumber,
          registerToken: await getRegisterToken(mobileNumber, now + registerExpiry),
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
