'use strict';

const chai = require('chai');
const log = require('logger-file-fun-line');

chai.should();

const has = Object.prototype.hasOwnProperty;

const defs = {
  code: 200,
  message: 'set message',
  type: 'application/json',
  successStatus: 'success',
  errorStatus: 'error',
  authCookieNamePatient: 'pat',
  authCookieNameDoctor: 'dat',
  authCookieShould: true,
  bodyTest: true,
  dataKeys: [],
  dataNotKeys: [],
  data: {},
};

const authCookieNameByHost = (host) => {
  const sub = host ? host.split('.').reverse()[2] : 'p';
  if (sub === 'doctor' || sub === 'doc' || sub === 'd') {
    return defs.authCookieNameDoctor;
  }
  return defs.authCookieNamePatient;
};

module.exports = (defaults = {}) => {
  const def = {
    ...defs,
    ...defaults,
  };
  return (res, ...args) => {
    const code = args.find(arg => typeof arg === 'number') || def.code;
    const message = args.find(arg => typeof arg === 'string') || def.message;
    const opts = args.find(arg => typeof arg === 'object') || {};
    const status = has.call(opts, 'status') ? opts.status : code < 400 ? def.successStatus : def.errorStatus;
    const dataShouldNotExist = has.call(opts, 'dataShouldNotExist') ? opts.dataShouldNotExist : code >= 400;
    const authCookieName = has.call(opts, 'authCookieName') ? opts.authCookieName : authCookieNameByHost(res.request.header.host);
    const {
      type,
      authCookieShould,
      bodyTest,
      dataKeys,
      dataNotKeys,
      data,
    } = {
      ...def,
      ...opts,
    };
    res.status.should.eql(code);
    res.type.should.eql(type);
    if (authCookieShould) res.should.have.cookie(authCookieName);
    if (!authCookieShould) res.should.not.have.cookie(authCookieName);
    if (!bodyTest) return;
    res.body.should.have.property('status', status);
    res.body.should.have.property('message', message);
    if (dataShouldNotExist) {
      res.body.should.not.have.property('data');
      return;
    }
    if (dataKeys.length === 0 && dataNotKeys.length === 0 && Object.keys(data).length === 0) return;
    res.body.should.have.property('data');
    dataKeys.forEach((key) => {
      res.body.data.should.have.nested.property(key);
    });
    dataNotKeys.forEach((key) => {
      res.body.data.should.not.have.nested.property(key);
    });
    Object.keys(data).forEach((key) => {
      res.body.data.should.have.nested.property(key, data[key]);
    });
  };
};
