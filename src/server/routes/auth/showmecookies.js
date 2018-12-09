'use strict';

const log = require('logger-file-fun-line');
const crypto = require('crypto');

const showmecookies = async (ctx) => {
  let cookie4000 = ctx.cookies.get('cookie4000');
  if (cookie4000) {
    ctx.body = {
      status: 'stored',
      length: cookie4000.length,
      cookie: cookie4000,
    };
  } else { // 3000 bytes coz base64 add 1/3
    cookie4000 = crypto.randomBytes(3000).toString('base64');
    ctx.body = {
      status: 'new',
      length: cookie4000.length,
      cookie: cookie4000,
    };
  }
  ctx.cookies.set(
    'cookie4000',
    cookie4000,
    {
      expires: new Date('2020-12-31'),
      httpOnly: true,
    },
  );
};

module.exports = {
  get: showmecookies,
  post: showmecookies,
};
