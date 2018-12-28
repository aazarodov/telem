'use strict';

const log = require('logger-file-fun-line');
const doctors = require('../../../db/queries/doctors');
const { encrypt } = require('../../../utils/crypto');
const { accessExpiry } = require('../../../../../secrets');
const unixtimestamp = require('../../../utils/unixtimestamp');

module.exports = {
  post: async (ctx) => {
    const { login, password } = ctx.state.data;
    const foundDoctor = await doctors.login(login, password);
    if (foundDoctor) {
      const did = foundDoctor._id;
      const expiry = unixtimestamp() + accessExpiry;
      ctx.cookies.set(
        'dat',
        await encrypt({ did, expiry, type: 'doctor' }),
        {
          expires: new Date(expiry * 1000),
          httpOnly: true,
        },
      );
      ctx.body = {
        status: 'success',
        message: 'login successful',
        data: {
          doctor: { name: foundDoctor.name, specialization: foundDoctor.specialization },
        },
      };
    } else {
      ctx.status = 404;
      ctx.body = {
        status: 'error',
        message: 'doctor with this login and password not found, or noActive',
      };
    }
  },
};
