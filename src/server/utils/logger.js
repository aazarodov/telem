'use strict';

const path = require('path');

const log = function logger(...args) {
  const prepareStackTraceOrig = Error.prepareStackTrace;
  Error.prepareStackTrace = (_, stack) => stack;
  const err = new Error();
  Error.captureStackTrace(err, logger);
  const stack = err.stack[0];
  Error.prepareStackTrace = prepareStackTraceOrig;
  console.log( // eslint-disable-line no-console
    `${path.basename(stack.getFileName())}:${stack.getFunctionName()}:${stack.getLineNumber()}: `.padEnd(22),
    ...args,
  );
};
module.exports = log;
