'use strict';

const log = require('logger-file-fun-line');
const doctors = require('../../../db/queries/doctors');
const { encrypt } = require('../../../utils/crypto');
const { accessExpiry, neverExpiry, oneSKey } = require('../../../../../secrets');
const unixtimestamp = require('../../../utils/unixtimestamp');

module.exports = {
  post: async (ctx) => {
    const { login, key, remember } = ctx.state.data;
    if (key !== oneSKey) {
      ctx.status = 403;
      ctx.body = {
        status: 'error',
        message: 'wrong key',
      };
      return;
    }
    const foundDoctor = await doctors.getByLogin(login);
    if (foundDoctor) {
      const did = foundDoctor._id;
      const expiry = remember ? neverExpiry : unixtimestamp() + accessExpiry;
      const group = foundDoctor.groupOfMis.name === 'Операторы' ? 'operator' : 'doctor';
      ctx.cookies.set(
        'dat',
        await encrypt({
          did, expiry, type: 'doctor', group,
        }),
        {
          expires: new Date(expiry * 1000),
          httpOnly: true,
        },
      );
      ctx.body = {
        status: 'success',
        message: 'login successful',
        data: {
          doctor: {
            name: foundDoctor.name,
            specialization: foundDoctor.specialization.presentation,
            group,
            childDoctor: foundDoctor.childDoctor,
            adultDoctor: foundDoctor.adultDoctor,
            meta: foundDoctor.meta,
          },
        },
      };
    } else {
      ctx.status = 404;
      ctx.body = {
        status: 'error',
        message: 'doctor with this login not found, or noActive',
      };
    }
  },
};
