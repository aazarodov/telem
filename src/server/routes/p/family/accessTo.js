'use strict';

const log = require('logger-file-fun-line');
const { addAccess, delAccess, updAccess } = require('../../../db/queries/family');
const { getByphoneNumber } = require('../../../db/queries/patients');
const dateTime = require('../../../utils/dateTimeFor1C');

module.exports = {
  put: async (ctx) => {
    const { data } = ctx.state;
    try {
      const foundPatient = await getByphoneNumber(data.phoneNumber);
      if (!foundPatient
        || foundPatient.lastName !== data.lastName
        || foundPatient.firstName !== data.firstName
        || foundPatient.middleName !== data.middleName
        || foundPatient.birthDate !== dateTime(data.birthDate)
      ) {
        ctx.status = 404;
        ctx.body = {
          status: 'error',
          message: 'patient not found',
        };
        return;
      }
      // if (foundPatient.status.presentation !== 'Активен'
      //   && foundPatient.status.presentation !== 'Новый') {
      //   ctx.status = 404;
      //   ctx.body = {
      //     status: 'error',
      //     message: 'found patient not activeted',
      //   };
      //   return;
      // }
      const response = await addAccess(
        ctx.state.access.pid,
        foundPatient._id,
        foundPatient.name,
        data.relation,
        data.access,
      );
      if (response.ok) {
        ctx.body = {
          status: 'success',
          message: 'accessTo added',
        };
      } else {
        ctx.status = 404;
        ctx.body = {
          status: 'error',
          message: 'error',
          error: response,
        };
      }
    } catch (error) {
      log(error);
      ctx.status = 500;
      ctx.body = {
        status: 'error',
        message: 'couchdb error',
        error: error.message,
      };
    }
  },
  delete: async (ctx) => {
    try {
      const response = await delAccess(
        ctx.state.access.pid,
        ctx.state.data.ref,
      );
      if (response.ok) {
        ctx.body = {
          status: 'success',
          message: 'accessTo deleted',
        };
      } else {
        ctx.status = 404;
        ctx.body = {
          status: 'error',
          message: 'error',
          error: response.reason,
        };
      }
    } catch (error) {
      log(error);
      ctx.status = 500;
      ctx.body = {
        status: 'error',
        message: 'couchdb error',
        error: error.message,
      };
    }
  },
  post: async (ctx) => {
    try {
      const response = await updAccess(
        ctx.state.access.pid,
        ctx.state.data,
      );
      if (response.ok) {
        ctx.body = {
          status: 'success',
          message: 'accessTo updated',
        };
      } else {
        ctx.status = 404;
        ctx.body = {
          status: 'error',
          message: 'error',
          error: response.reason,
        };
      }
    } catch (error) {
      log(error);
      ctx.status = 500;
      ctx.body = {
        status: 'error',
        message: 'couchdb error',
        error: error.message,
      };
    }
  },
};
