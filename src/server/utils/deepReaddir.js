'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');

const stat = util.promisify(fs.stat);
const readdir = util.promisify(fs.readdir);

const deepReaddirSync = (dir, ext = '.js') => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((fileName) => {
    const file = path.resolve(dir, fileName);
    const stats = fs.statSync(file);
    if (stats && stats.isDirectory()) {
      const res = deepReaddirSync(file);
      results = results.concat(res);
    } else if (path.extname(file) === ext) results.push(file);
  });
  return results;
};

const deepReaddir = async (dir, ext = '.js') => {
  let results = [];
  const list = await readdir(dir);
  const listPromises = list.map(async (fileName) => {
    const file = path.resolve(dir, fileName);
    const stats = await stat(file);
    if (stats && stats.isDirectory()) {
      const res = await deepReaddir(file);
      results = results.concat(res);
    } else if (path.extname(file) === ext) results.push(file);
  });
  await Promise.all(listPromises);
  return results;
};

module.exports = {
  deepReaddir,
  deepReaddirSync,
};
