'use strict';

const uuid = require('uuid/v1');

module.exports = prefix => () => `${prefix}|${uuid()}`;
