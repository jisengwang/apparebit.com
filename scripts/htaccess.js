#!/usr/bin/env node
/* (C) Copyright 2019 Robert Grimm. Released under MIT license. */
'use strict';

const { CONFIG_FILES, SOURCE_ROOT } = require('./config.js');
const { createHash } = require('crypto');
/* Don't use `.` for text between tags since it doesn't match newlines. */
const INLINE_SCRIPT = /<script>([\s\S]*?)<\/script>/u;
const { join } = require('path');
const { readFile, writeFile } = require('fs').promises;
const { spawn } = require('child_process');
const { log } = require('./util');

const DOT_HTACCESS = join(CONFIG_FILES, '.htaccess');
const BUILD_SH = join(
  __dirname, '..', '..', 'server-configs-apache', 'bin', 'build.sh'
);

function hash(s) {
  const h = createHash('sha256').update(s, 'utf8').digest('base64');
  return `'sha256-${h}'`;
}

function hashInlineScripts(html) {
  return [...html.matchAll(INLINE_SCRIPT)]
    .map(match => match[1])
    .map(hash)
    .join(' ');
}

function build() {
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

  // 2. Determine SHA-256 hash for each inline script element.
  log(); log(`Hash inline scripts`);
  const frontpage = await readFile(join(SOURCE_ROOT, 'index.html'), 'utf8');
  const hashes = hashInlineScripts(frontpage);

  // 3. Inject into .htaccess configuration.
  log(`Inject into .htaccess`);
  let config = await readFile(DOT_HTACCESS, 'utf8');
  config = config.replace(
    `script-src 'self' www.google-analytics.com;`,
    `script-src 'self' ${hashes} www.google-analytics.com;`
  );
  await writeFile(DOT_HTACCESS, config, 'utf8');
}

if (require.main === module) {
  htaccess();
} else {
  module.exports.htaccess = htaccess;
}
