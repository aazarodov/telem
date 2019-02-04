'use strict';

const { couchdbUrlDev, couchdbUrlProd } = require('../../../secrets');

const couchdbUrl = process.env.NODE_ENV === 'production' ? couchdbUrlProd : couchdbUrlDev;
module.exports = require('nano')(process.env.COUCHDB_URL || couchdbUrl);
