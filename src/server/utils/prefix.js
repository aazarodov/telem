'use strict';

module.exports = (dbname) => {
  if (!process.env.NODE_ENV) return `test_${dbname}`;
  if (process.env.NODE_ENV === 'production') return dbname;
  return `${process.env.NODE_ENV}_${dbname}`;
};
