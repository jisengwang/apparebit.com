#!/usr/bin/env node
'use strict';

const {
  copyFile, mkdir, readdir, readFile, writeFile
} = require('fs').promises;

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
  SCRIPTS
} = require('./config.js');

const { validate } = require('./validate.js');

const BUILD = Symbol('build');
const COPY = Symbol('copy');
const DONE = Symbol('done');
const IS_VERBOSE = process.argv.includes('--verbose');
const MKDIR = Symbol('mkdir');
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
      detail = `${operation.description} ${chalk.blue(detail)}`;
      break;;
    case COPY:
      if (!IS_VERBOSE) return;
      detail = ` ${operation.description} ${chalk.blue(detail)}`;
      break;
     case STYLE:
      if (!IS_VERBOSE) return;
      detail = `${operation.description} ${chalk.blue(detail)}`;
      break;
    case DONE:
      detail = chalk.green(detail);
      break;
    default:
      // Nothing to do.
  }
  console.error(chalk.grey('[build]'), detail);
}

async function build() {
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

  announce(BUILD);
  const source = resolve(SOURCE_ROOT);
  const target = resolve(TARGET_ROOT);

  announce(MKDIR, target);
  await rimraf(target);
  await mkdir(target);

  // ===== Copies =====

  for (const dir of DIRECTORIES_TO_COPY) {
    const from = join(source, dir);
    const to = join(target, dir);
    const entries = await readdir(from, { withFileTypes: true });

    announce(MKDIR, to);
    await mkdir(to, { recursive: true });

    for (const entry of entries) {
      if (!entry.isFile()) continue;

      const from2 = resolve(from, entry.name);
      const to2 = resolve(to, entry.name);

      announce(COPY, from2, to2);
      await copyFile(from2, to2);
    }
  }

  for (const file of FILES_TO_COPY) {
    const from = join(source, file);
    const to = join(target, file);

    announce(COPY, from, to);
    await copyFile(from, to);
  }

  // ===== Styles =====

  for (const file of STYLES) {
    const from = join(source, file);
    const to = join(target, file);

    announce(STYLE, from, to);
    const input = await readFile(from);
    const output = await postcss.process(input, { from, to });
    output.warnings().forEach(warn => {
      process.stderr.write(warn.toString())
    });

    await writeFile(to, output.css);
  }

  // ===== Scripts =====

  for (const file of SCRIPTS) {
    const from = join(source, file);
    const to = join(target, file);

    announce(COPY, from, to);
    await copyFile(from, to);
  }

  // ===== Done =====
  announce(DONE, `Created ${directories} directories with ${files} files`);
  announce(DONE, 'Happy, happy, joy, joy!');
}

process.chdir(resolve(__dirname, '..'));
build();
