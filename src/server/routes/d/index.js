'use strict';

module.exports = {
  get: async (ctx) => {
    ctx.body = {
      status: 'success',
      message: `${process.env.NODE_ENV} doctor index`,
    };
  },
};
