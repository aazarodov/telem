'use strict';

const log = require('logger-file-fun-line');
const { encrypt, decrypt } = require('../utils/crypto');
const { accessExpiry } = require('../../../secrets');
const unixtimestamp = require('../utils/unixtimestamp');


module.exports = () => async (ctx, next) => {
  ctx.state.access = {};
  if (
    ctx.path === '/'
    || ctx.path === '/p/'
    || ctx.path === '/d/'
    || ctx.path.indexOf('/p/auth/') === 0
    || ctx.path.indexOf('/p/dev/') === 0
    || ctx.path.indexOf('/d/auth/') === 0
    || ctx.path.indexOf('/d/dev/') === 0
    || ctx.path.indexOf('/p/external/') === 0
  ) {
    await next();
    return;
  }
  const accessType = ctx.path.indexOf('/p/') === 0 ? 'patient' : 'doctor';
  const cookieName = accessType === 'patient' ? 'pat' : 'dat';
  const accessToken = ctx.cookies.get(cookieName);
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
  if (tokenData.type !== accessType) {
    ctx.status = 403;
    ctx.body = {
      status: 'error',
      message: 'access deny',
      error: 'accessToken wrong type',
    };
    return;
  }
  if (ctx.path.indexOf('/d/support/') === 0 && tokenData.group !== 'operator') {
    ctx.status = 403;
    ctx.body = {
      status: 'error',
      message: 'access deny',
      error: 'accessToken wrong doctor group',
    };
    return;
  }
  if (accessType === 'patient') {
    ctx.state.access.pid = tokenData.pid;
  } else {
    ctx.state.access.did = tokenData.did;
  }
  await next();
  const newExpiry = unixtimestamp() + accessExpiry;
  const expiry = newExpiry > tokenData.expiry ? newExpiry : tokenData.expiry;
  const newTokenData = { ...tokenData, expiry };
  ctx.cookies.set(
    cookieName,
    await encrypt(newTokenData),
    {
      expires: new Date(expiry * 1000),
      httpOnly: true,
    },
  );
};
