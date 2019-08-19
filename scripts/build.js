#!/usr/bin/env node
'use strict';

const {
  copyFile, mkdir, readdir, readFile, writeFile
} = require('fs').promises;

const babel = require('@babel/core');
const chalk = require('chalk');
const { join, resolve } = require('path');
const { promisify } = require('util');
const rimraf = promisify(require('rimraf'));

const postcss = require('postcss')([
  require('cssnano')({
    preset: ['default', {
      svgo: false,
    }],
  }),
]);

const {
  SOURCE_ROOT,
  TARGET_ROOT,
  DIRECTORIES_TO_COPY,
  FILES_TO_COPY,
  STYLES,
  SCRIPTS,
  TOKENS,
} = require('./config.js');

const { validate } = require('./validate.js');

const BUILD = Symbol('build');
const COPY = Symbol('copy');
const DONE = Symbol('done');
const IS_VERBOSE = process.argv.includes('--verbose');
const MKDIR = Symbol('mkdir');
const SCRIPT = Symbol('script');
const STYLE = Symbol('style');
const VALIDATE = Symbol('validate');

let directories = 0;
let files = 0;

function announce(operation, ...args) {
  if (operation === MKDIR) {
    directories++;
  } else if (operation === COPY || operation === STYLE) {
    files++;
  }

  let detail = args[args.length - 1];
  switch (operation) {
    case VALIDATE:
      detail = chalk.magenta(`Validate ${detail}`);
      break;
    case BUILD:
      detail = chalk.magenta(`Build`);
      break;
    case MKDIR:
      if (!IS_VERBOSE) return;
      detail = ` ${operation.description} ${chalk.blue(detail)}`;
      break;;
    case COPY:
      if (!IS_VERBOSE) return;
      detail = `  ${operation.description} ${chalk.blue(detail)}`;
      break;
    case SCRIPT:
      if (!IS_VERBOSE) return;
      detail = `${operation.description} ${chalk.blue(detail)}`;
      break;
    case STYLE:
      if (!IS_VERBOSE) return;
      detail = ` ${operation.description} ${chalk.blue(detail)}`;
      break;
    case DONE:
      detail = chalk.green(detail);
      break;
    default:
      // Nothing to do.
  }
  console.error(chalk.grey('[build]'), detail);
}

function withCopyright(text) {
  return '/* (C) Copyright 2019 Robert Grimm */ ' + text;
}

async function copy(file, source, target) {
  const from = join(source, file);
  const to = join(target, file);
  announce(COPY, from, to);
  return copyFile(from, to);
}

async function build() {
  // =================================== Validate ==============================
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

  // =================================== Build ==============================
  announce(BUILD);
  const root = resolve(__dirname, '..');
  const source = join(root, SOURCE_ROOT);
  const target = join(root, TARGET_ROOT);

  announce(MKDIR, target);
  await rimraf(target);
  await mkdir(target);

  // Copy entire directories.
  for (const dir of DIRECTORIES_TO_COPY) {
    const from = join(source, dir);
    const to = join(target, dir);
    const entries = await readdir(from, { withFileTypes: true });

    announce(MKDIR, to);
    await mkdir(to, { recursive: true });

    for (const entry of entries) {
      if (!entry.isFile()) continue;
      await copy(entry.name, from , to);
    }
  }

  // Copy select files.
  for (const file of FILES_TO_COPY) {
    await copy(file, source, target);
  }

  // Process styles.
  for (const file of STYLES) {
    const from = join(source, file);
    const to = join(target, file);

    announce(STYLE, from, to);
    const input = await readFile(from);
    const output = await postcss.process(input, { from, to });
    output.warnings().forEach(warn => {
      process.stderr.write(warn.toString())
    });

    await writeFile(to, withCopyright(output.css));
  }

  // Process scripts.
  for (const file of SCRIPTS) {
    const from = join(source, file);
    const to = join(target, file);

    announce(SCRIPT, from, to);
    const input = await readFile(from);
    const output = await babel.transformAsync(input, {
      filename: from,
      presets: ["minify"],
      comments: false,
    });

    await writeFile(to, withCopyright(output.code));
  }

  const tokens = join(root, 'tokens');
  for (const file of TOKENS) {
    await copy(file, tokens, target);
  }

  // =================================== Done ==============================
  announce(DONE, `Created ${directories} directories with ${files} files`);
  announce(DONE, 'Happy, happy, joy, joy!');
}

process.chdir(resolve(__dirname, '..'));
build();
