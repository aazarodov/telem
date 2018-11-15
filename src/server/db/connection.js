'use strict';

const { couchdbUrl } = require('../../../secrets');

module.exports = require('nano')(process.env.COUCHDB_URL || couchdbUrl);
