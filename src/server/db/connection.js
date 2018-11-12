'use strict';

module.exports = require('nano')(process.env.COUCHDB_URL || 'http://admin:qwe123QWEzxcIOP@telem.ml:5984');
