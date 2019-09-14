/* (C) Copyright 2019 Robert Grimm. Released under MIT license. */
'use strict';

const { blue, bold, grey, magenta } = require('chalk');

const VERBOSE = process.argv.includes('--verbose');

module.exports.logger = function logger(tool) {
  function println(text) {
    console.error(grey(`[${tool}]`), text);
  }

  function log(message) {
    if (!message) {
      console.error();
    } else {
      message = typeof message === 'string' ? message : stringify(message);
      message = magenta(message);
      println(VERBOSE ? bold(message) : message);
    }
  }

  function logv(detail) {
    if (!detail) {
      console.error();
    } else {
      println(blue(detail));
    }
  }

  log.logv = VERBOSE ? logv : () => {};
  return log;
}
