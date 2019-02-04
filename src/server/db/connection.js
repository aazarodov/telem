'use strict';

const { couchdbUrlDev, couchdbUrlProd } = require('../../../secrets');

const couchdbUrl = process.env.NODE_ENV === 'production' ? couchdbUrlProd : couchdbUrlDev;
// process.env.COUCHDB_URL ||
module.exports = require('nano')(couchdbUrl);
