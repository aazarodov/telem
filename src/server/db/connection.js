'use strict';

const { couchdbUrlDev, couchdbUrlProd } = require('../../../secrets');

const couchdbUrl = process.env.NODE_ENV === 'production' ? couchdbUrlProd : couchdbUrlDev;
// process.env.COUCHDB_URL ||
console.log(process.env.NODE_ENV, couchdbUrl);
module.exports = require('nano')(couchdbUrl);
