'use strict';

module.exports = {
  get: async (ctx) => {
    ctx.status = 404;
    ctx.body = {
      status: 'error',
      message: 'use subdomain d, doc, doctor OR p, pat, patient',
    };
  },
};
