'use strict';

const log = require('logger-file-fun-line');
const { encrypt, decrypt } = require('../utils/crypto');
const { accessExpiry } = require('../../../secrets');
const unixtimestamp = require('../utils/unixtimestamp');


module.exports = () => async (ctx, next) => {
  if (
    ctx.path === '/'
    || ctx.path === '/p/'
    || ctx.path.indexOf('/p/auth/') === 0
    || ctx.path.indexOf('/p/dev/') === 0
  ) {
    ctx.state.access = null;
    await next();
    return;
  }
  const accessToken = ctx.cookies.get('pat');
  if (!accessToken) {
    ctx.status = 403;
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
    ctx.status = 403;
    ctx.body = {
      status: 'error',
      message: 'access deny',
      error: 'accessToken incorrect',
    };
    return;
  }
  if (!tokenData.expiry || tokenData.expiry <= unixtimestamp()) {
    ctx.status = 403;
    ctx.body = {
      status: 'error',
      message: 'access deny',
      error: 'accessToken expired',
    };
    return;
  }
  ctx.state.access = tokenData;
  await next();
  const expiry = unixtimestamp() + accessExpiry;
  const newTokenData = { ...ctx.state.access, expiry };
  ctx.cookies.set(
    'pat',
    await encrypt(newTokenData),
    {
      expires: new Date(expiry * 1000),
      httpOnly: true,
    },
  );
};
