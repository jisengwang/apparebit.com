#!/usr/bin/env node
/* (C) Copyright 2019 Robert Grimm. Released under MIT license. */
'use strict';

const { CONFIG_FILES } = require('./config.js');
const { join } = require('path');
const { spawn } = require('child_process');
const { logger } = require('./util');
const log = logger('htaccess');

const BUILD_SH = join(
  __dirname, '..', '..', 'server-configs-apache', 'bin', 'build.sh'
);

function htaccess() {
  let resolve, reject, promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  spawn('bash', [BUILD_SH], {
    cwd: CONFIG_FILES,
    stdio: 'inherit',
  })
  .on('error', reject)
  .on('exit', resolve);

  return promise;
}

async function htaccess() {
  // 1. Build the .htaccess configuration.
  log(`Build .htaccess`);
  await build();
}

if (require.main === module) {
  htaccess();
} else {
  module.exports.htaccess = htaccess;
}
