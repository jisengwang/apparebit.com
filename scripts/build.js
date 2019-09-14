#!/usr/bin/env node
/* (C) Copyright 2019 Robert Grimm. Released under MIT license. */
'use strict';

const {
  CONFIG_FILES,
  SOURCE_ROOT,
  TARGET_ROOT,
  DIRECTORIES_TO_COPY,
  FILES_TO_COPY,
  STYLES,
  SCRIPTS,
} = require('./config.js');

const {
  copyFile, mkdir, readdir, readFile, writeFile
} = require('fs').promises;

const babel = require('@babel/core');
const { join, resolve } = require('path');
const { logger } = require('./util.js');
const log = logger('build');
const { promisify } = require('util');
const rimraf = promisify(require('rimraf'));

const postcss = require('postcss')([
  require('cssnano')({
    preset: ['default', {
      svgo: false,
    }],
  }),
]);

const { validate } = require('./validate.js');

// Flags
const IS_VERBOSE = process.argv.includes('--verbose');

// Processing phases
const VALIDATE = Symbol('validate');
const GENERATE = Symbol('generate');
const DONE = Symbol('done');

// Resource-specific operations
const MKDIR = Symbol('mkdir');
const COPY = Symbol('copy');
const BUILD = Symbol('build');

let directories = 0;
let files = 0;

function announce(operation, ...args) {
  if (operation === MKDIR) {
    directories++;
  } else if (operation === COPY || operation === BUILD) {
    files++;
  }

  let detail = args[args.length - 1];
  if (operation === VALIDATE) {
    log(`Validate ${detail}`);
  } else if (operation === GENERATE) {
    log(`Generate ${detail}`);
  } else if (operation === DONE) {
    log(detail);
  } else if (!IS_VERBOSE) {
    return;
  } else if (operation === MKDIR) {
    log.logv(`${operation.description} ${detail}`);
  } else if (operation === COPY) {
    log.logv(` ${operation.description} ${detail}`);
  } else if (operation === BUILD) {
    log.logv(`${operation.description} ${detail}`);
  } else {
    throw new Error(`unknown operation ${operation}`);
  }
}

function withCopyright(text) {
  return (
    '/* (C) Copyright 2019 Robert Grimm. Released under MIT license. */ ' +
    text
  );
}

function copy(file, source, target) {
  const from = join(source, file);
  const to = join(target, file);
  announce(COPY, from, to);
  return copyFile(from, to);
}

async function copyDirectory(source, target) {
  const entries = await readdir(source, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    await copy(entry.name, source, target);
  }
}

async function build() {
  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Validate HTML
  announce(VALIDATE, 'HTML');

  let status;
  try {
    status = await validate();
  } catch (x) {
    console.error(x.stack);
    process.exitCode = 1;
    return;
  }

  if (status) {
    process.exitCode = status;
    return;
  }

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Generate Content
  announce(GENERATE, 'content');

  announce(MKDIR, TARGET_ROOT);
  await rimraf(TARGET_ROOT);
  await mkdir(TARGET_ROOT);

  // ........................................ Copy entire directories
  for (const dir of DIRECTORIES_TO_COPY) {
    const from = join(SOURCE_ROOT, dir);
    const to = join(TARGET_ROOT, dir);

    announce(MKDIR, to);
    await mkdir(to, { recursive: true });
    await copyDirectory(from, to);
  }

  await copyDirectory(CONFIG_FILES, TARGET_ROOT);

  // ........................................ Copy select files
  for (const file of FILES_TO_COPY) {
    await copy(file, SOURCE_ROOT, TARGET_ROOT);
  }

  // ........................................ Build styles
  for (const file of STYLES) {
    const from = join(SOURCE_ROOT, file);
    const to = join(TARGET_ROOT, file);

    announce(BUILD, from, to);
    const input = await readFile(from);
    const output = await postcss.process(input, { from, to });
    output.warnings().forEach(warn => {
      process.stderr.write(warn.toString())
    });

    await writeFile(to, withCopyright(output.css));
  }

  // ........................................ Build scripts
  for (const file of SCRIPTS) {
    const from = join(SOURCE_ROOT, file);
    const to = join(TARGET_ROOT, file);

    announce(BUILD, from, to);
    const input = await readFile(from);
    const output = await babel.transformAsync(input, {
      filename: from,
      presets: ["minify"],
      comments: false,
    });

    await writeFile(to, withCopyright(output.code));
  }

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Done
  announce(DONE, `Created ${directories} directories with ${files} files`);
  announce(DONE, 'Happy, happy, joy, joy!');
}

process.chdir(resolve(__dirname, '..'));
build();
