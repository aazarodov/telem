'use strict';

const getCookie = (cookieHeader, cookieName) => {
  if (!cookieHeader) return null;
  const cookieNameEq = `${cookieName}=`;
  const cookieNameEqIndex = cookieHeader.indexOf(cookieNameEq);
  if (cookieNameEqIndex === -1) return null;
  const startIndex = cookieNameEqIndex + cookieNameEq.length;
  const semicolonIndex = cookieHeader.indexOf(';', startIndex);
  if (semicolonIndex === -1) {
    return decodeURIComponent(cookieHeader.substring(startIndex));
  }
  return decodeURIComponent(cookieHeader.substring(startIndex, semicolonIndex));
};

module.exports = getCookie;
