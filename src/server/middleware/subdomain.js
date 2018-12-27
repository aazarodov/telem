'use strict';

const log = require('logger-file-fun-line');

module.exports = () => async (ctx, next) => {
  if (ctx.subdomains.length) {
    const sub = ctx.subdomains[0];
    if (sub === 'doctor' || sub === 'doc' || sub === 'd') {
      ctx.url = `/d${ctx.url}`;
    } else if (sub === 'patient' || sub === 'pat' || sub === 'p' || sub === 'api') {
      ctx.url = `/p${ctx.url}`;
    } else {
      ctx.url = '/';
    }
  } else { // legacy
    ctx.url = `/p${ctx.url}`;
  }
  await next();
};
