'use strict';

const dateTime = function dateTime(date) {
  const today = date ? new Date(date) : new Date();
  return `${today.toISOString().substring(0, 10)}T00:00:00`;
};
module.exports = dateTime;
