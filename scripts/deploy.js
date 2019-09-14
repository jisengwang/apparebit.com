#!/usr/bin/env node
/* (C) Copyright 2019 Robert Grimm. Released under MIT license. */
'use strict';

const { logger } = require('./util.js');
const log = logger('deploy');
const { TARGET_ROOT } = require('./config.js');
const source = TARGET_ROOT + (TARGET_ROOT.endsWith('/') ? '' : '/');
const { spawn } = require('child_process');

async function deploy() {
  log('Deploy apparebit.com');
  let resolve, reject, promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  // rsync <options> source target
  //     NB Source path must end with slash to sync contents, not directory.
  //
  // -c, --checksum           use checksum not file size and modification time
  // -e, --rsh=COMMAND        remote shell
  // -n, --dry-run            dry run
  // -r, --recursive          recursively
  // -u, --update             skip destination files with newer timestamp
  // -v, --verbose            verbose
  //     --exclude=PATTERN    exclude from source
  //     --delete             delete from destination

  const options = [
    '-cruv',
    '-e', 'ssh -p 2222',
    '--exclude', 'cgi-bin',
    '--exclude', '.well-known',
    '--exclude', '.DS_Store',
    '--exclude', '.git',
    '--delete',
  ];

  if (process.argv.includes('--dry-run')) options.push('--dry-run');

  spawn('rsync', [
    ...options,
    source,
    'rgrimm@192.232.251.218:public_html/'
  ], {
    stdio: 'inherit',
  })
  .on('error', reject)
  .on('exit', resolve);

  await promise;
  log('Done');
}

if (require.main === module) {
  deploy();
} else {
  module.exports.deploy = deploy;
}
