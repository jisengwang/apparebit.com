#!/usr/bin/env node
'use strict';

const IS_VERBOSE = process.argv.includes('--verbose');
const { resolve: resolvePath } = require('path');
const { SOURCE_ROOT } = require('./config.js');
const { spawn } = require('child_process');

async function deploy() {
  let resolve, reject, promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  spawn('rsync', [
    '-ruv',
    '-e', 'ssh -p 2222',
    '--delete',
    resolvePath(__dirname, '..', SOURCE_ROOT),
    'rgrimm@192.232.251.218:public_html/'
  ], {
    stdio: 'inherit',
  })
  .on('error', reject)
  .on('exit', resolve);

  return promise;
}

if (require.main === module) {
  deploy();
} else {
  module.exports.deploy = deploy;
}
