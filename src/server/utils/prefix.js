'use strict';

module.exports = (dbname) => {
  if (process.env.NODE_ENV === 'test') return `test_${dbname}`;
  if (process.env.NODE_ENV === 'development') return `dev_${dbname}`;
  return dbname;
};
