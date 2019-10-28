#!/usr/bin/env node
'use strict';

const IS_VERBOSE = process.argv.includes('--verbose');
const { resolve: resolvePath } = require('path');
const { SOURCE_ROOT } = require('./config.js');
const { spawn } = require('child_process');
const vnuPath = require('vnu-jar');

const PATTERNS = [
  `CSS: “backdrop-filter”: Property “backdrop-filter” doesn't exist.`,
  `CSS: “background-image”: “0%” is not a “color” value.`,
  `CSS: “color-adjust”: Property “color-adjust” doesn't exist.`,
  `File was not checked. Files must have .html, .xhtml, .htm, or .xht extensions.`,
  `The “contentinfo” role is unnecessary for element “footer”.`,
];

function validate() {
  let resolve, reject, promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  spawn('java', [
    '-jar', vnuPath,
    '--skip-non-html',
    '--filterpattern', PATTERNS.join('|'),
    ...(IS_VERBOSE ? ['--verbose'] : []),
    resolvePath(__dirname, '..', SOURCE_ROOT),
  ], {
    stdio: ['ignore', 'inherit', 'inherit'],
  })
  .on('error', reject)
  .on('exit', resolve);

  return promise;
}

if (require.main === module) {
  validate();
} else {
  module.exports.validate = validate;
}
