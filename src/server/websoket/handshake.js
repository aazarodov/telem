'use strict';

const log = require('logger-file-fun-line');
const getCookie = require('../utils/getCookie');
const { decrypt } = require('../utils/crypto');
const unixtimestamp = require('../utils/unixtimestamp');
const patients = require('../db/queries/patients');
const doctors = require('../db/queries/doctors');

module.exports = {
  async verifyClient(info, callback) {
    const { host, cookie } = info.req.headers;
    const accessType = host.indexOf('doctor.') === 0 ? 'doctor' : 'patient';
    const accessToken = getCookie(cookie, accessType === 'doctor' ? 'dat' : 'pat');
    if (accessToken) {
      let tokenData;
      try {
        tokenData = await decrypt(accessToken);
      } catch (error) {
        return callback(false, 403, 'access deny, try to login');
      }
      if (!tokenData.expiry
        || tokenData.expiry <= unixtimestamp()
        || tokenData.type !== accessType) {
        return callback(false, 403, 'access deny, try to login');
      }
      let userDoc;
      if (tokenData.type === 'patient') {
        userDoc = await patients.getById(tokenData.pid);
      } else {
        userDoc = await doctors.getById(tokenData.did);
      }
      if (!userDoc) {
        log(`ALERT fake accessToken ${accessToken}`);
        return callback(false, 403, 'access deny, try to login');
      }
      delete userDoc._rev;
      delete userDoc.password;
      // eslint-disable-next-line no-param-reassign
      info.req.state = {
        access: tokenData,
        userDoc,
      };
      return callback(true);
    }
    return callback(false, 403, 'access deny, try to login');
  },
  handleProtocols(protocols /* , req */) {
    if (protocols.indexOf('jsonrpc-telem') === -1) {
      return false;
    }
    return 'jsonrpc-telem';
  },
};
