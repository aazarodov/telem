'use strict';

const log = require('logger-file-fun-line');
const getCookie = require('../utils/getCookie');
const { decrypt } = require('../utils/crypto');
const unixtimestamp = require('../utils/unixtimestamp');

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
      // eslint-disable-next-line no-param-reassign
      info.req.state = {
        access: tokenData,
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
