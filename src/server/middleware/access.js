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
  const accessToken = ctx.request.body.accessToken
    ? ctx.request.body.accessToken : ctx.query.accessToken;
  if (!accessToken) {
    ctx.status = 400;
    ctx.body = {
      status: 'error',
      message: 'accessToken absent',
      error: { query: ctx.query, body: ctx.request.body },
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
      message: 'accessToken incorrect',
      error: { query: ctx.query, body: ctx.request.body, error },
    };
    return;
  }
  if (!tokenData.expiry || tokenData.expiry <= unixtimestamp()) {
    ctx.status = 400;
    ctx.body = {
      status: 'error',
      message: 'accessToken expired',
      error: { query: ctx.query, body: ctx.request.body, expiry: tokenData.expiry },
    };
    return;
  }
  ctx.state.access = tokenData;
  await next();
  const newTokenData = { ...ctx.state.access, expiry: unixtimestamp() };
  ctx.body.accessToken = await encrypt(newTokenData);
};
