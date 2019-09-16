/* (C) Copyright 2019 Robert Grimm. Released under MIT license. */
'use strict';

const { basename } = require('path');
const { blue, bold, grey, magenta, red } = require('chalk');
const { isNativeError } = require('util').types;
const { stringify } = JSON;
const TOOL = basename(process.mainModule.filename, '.js');
const VERBOSE = process.argv.includes('--verbose');

function checkNodeVersion() {
  const version = process.versions.node.split('.').map(Number);
  if (version[0] < 12 || version[0] === 12 && version[1] < 10) {
    error(`${TOOL} tool requires at least Node.js 12.10.0!`);
    process.exit(1);
  }
}

function println(text) {
  console.error(grey(`[${TOOL}]`), text);
}

function error(err) {
  if (isNativeError(err)) {
    err = err.stack;
  } else {
    err = String(err);
  }

  const [first, ...rest] = err.split(/\r?\n/u);
  println(red(bold(first)));
  for (const line of rest) println(line);
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

module.exports = {
  checkNodeVersion,
  error,
  log,
  logv: VERBOSE ? logv : () => {},
}
