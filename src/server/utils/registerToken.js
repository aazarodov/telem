'use strict';

const crypto = require('crypto-promise');
const { salt, sign } = require('../../../secrets');

const smsToken = async (mobileNumber, expiry) => {
  const hash = await crypto.hash('sha256')(`registerToken${mobileNumber}${expiry}${salt}${sign}`);
  return hash.toString('hex');
};
module.exports = smsToken;
