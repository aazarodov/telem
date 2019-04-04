'use strict';

const trimDate = dt => (typeof dt.toISOString === 'function'
  ? `${dt.toISOString().slice(0, 10)}`
  : `${dt.slice(0, 10)}`);
module.exports = trimDate;
