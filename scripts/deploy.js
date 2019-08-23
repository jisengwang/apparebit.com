#!/usr/bin/env node
'use strict';

const { TARGET_ROOT } = require('./config.js');
const { spawn } = require('child_process');

function deploy() {
  let resolve, reject, promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  spawn('rsync', [
    '-ruv',
    '-e', 'ssh -p 2222',
    '--exclude', 'cgi-bin *~ .DS_Store',
    '--delete',
    TARGET_ROOT,
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
