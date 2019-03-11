'use strict';

const { readdirSync } = require('fs');
const { join } = require('path');

module.exports = (dir) => {
  const list = readdirSync(dir);
  const content = {};
  list.forEach((file) => {
    const name = file.slice(0, -3);
    // eslint-disable-next-line global-require, import/no-dynamic-require
    content[name] = require(join(dir, file));
  });
  return content;
};
