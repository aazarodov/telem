'use strict';

const log = require('logger-file-fun-line');
const { encrypt, decrypt } = require('../utils/crypto');
const unixtimestamp = require('../utils/unixtimestamp');


module.exports = () => async (ctx, next) => {
  if (ctx.path === '/' || ctx.path.indexOf('/auth/') === 0) {
    ctx.state.access = null;
    await next();
    return;
  }
  const accessToken = ctx.cookies.get('pat');
  if (!accessToken) {
    ctx.status = 400;
    ctx.body = {
      status: 'error',
      message: 'access deny',
      error: 'accessToken absent',
    };
    return;
  }
  let tokenData;
  try {
    tokenData = await decrypt(accessToken);
  } catch (error) {
    ctx.status = 400;
    ctx.body = {
      status: 'error',
      message: 'access deny',
      error: 'accessToken incorrect',
    };
    return;
  }
  if (!tokenData.expiry || tokenData.expiry <= unixtimestamp()) {
    ctx.status = 400;
    ctx.body = {
      status: 'error',
      message: 'access deny',
      error: 'accessToken expired',
    };
    return;
  }
  ctx.state.access = tokenData;
  await next();
  const expiry = unixtimestamp();
  const newTokenData = { ...ctx.state.access, expiry };
  ctx.cookies.set(
    'pat', // Patient Access Token
    await encrypt(newTokenData),
    {
      expires: new Date(expiry * 1000),
      httpOnly: true,
    },
  );
};
