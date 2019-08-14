#!/usr/bin/env node
'use strict';

const { join } = require('path');
const { SOURCE_ROOT, MARKUP } = require('./config.js');
const { spawn } = require('child_process');
const vnuPath = require('vnu-jar');

async function checkHTML() {
  let erroneous = false;

  for (const relname of MARKUP) {
    const file = join(SOURCE_ROOT, relname);
    const checker = spawn('java', [
      '-jar', vnuPath,
      '--verbose',
      file,
    ],{
      stdio: 'inherit',
    });

    let resolve, promise = new Promise(res => {
      resolve = res;
    });

    checker.on('close', status => {
      if (status) erroneous = true;
      resolve(status);
    });

    await promise;
  }

  process.exitCode = erroneous ? 665 : 0;
}

checkHTML();
