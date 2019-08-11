#!/usr/bin/env node
'use strict';

const {
  copyFile, mkdir, readdir, readFile, writeFile
} = require('fs').promises;

const chalk = require('chalk');
const { extname, join, resolve } = require('path');
const { promisify } = require('util');
const rimraf = promisify(require('rimraf'));

const postcss = require('postcss')([
  require('cssnano')({
    preset: ['default', {
      svgo: false,
    }],
  }),
]);

const SOURCE_ROOT = 'content';
const TARGET_ROOT = 'build';

const DIRECTORIES_TO_COPY = [
  'about',
  'assets/fonts',
  'assets/icons',
  'assets/images',
  'features/do-you-be',
  'features/ubu-trump',
];

const FILES_TO_COPY = [
  '403.html',
  '404.html',
  'index.html',
];

const STYLES = [
  'assets/form.css',
];

const SCRIPTS = [
  'assets/function.js',
]

const TOOL  = chalk.grey('[build]');
const COPY  = Symbol(' copy');
const MKDIR = Symbol('mkdir');
const STYLE = Symbol('style');

function logFileOp(operation, ...files) {
  const names = files.map(name => {
    const quoted = `"${name}"`;
    switch (extname(name)) {
      case '.html':
        return chalk.blue(quoted);
      case '.jpg':
      case '.png':
      case '.svg':
        return chalk.cyan(quoted);
      case '.woff':
      case '.woff2':
        return chalk.green(quoted);
      default:
        return chalk.gray(quoted);
    }
  });

  const op = operation.description;
  if (op === 'mkdir') console.error(TOOL);
  console.error(TOOL, op, names[names.length - 1]);
}

async function build() {
  const source = resolve(SOURCE_ROOT);
  const target = resolve(TARGET_ROOT);

  logFileOp(MKDIR, target);
  await rimraf(target);
  await mkdir(target);

  // ===== Copies =====

  for (const dir of DIRECTORIES_TO_COPY) {
    const from = join(source, dir);
    const to = join(target, dir);
    const entries = await readdir(from, { withFileTypes: true });

    logFileOp(MKDIR, to);
    await mkdir(to, { recursive: true });

    for (const entry of entries) {
      if (!entry.isFile()) continue;

      const from2 = resolve(from, entry.name);
      const to2 = resolve(to, entry.name);

      logFileOp(COPY, from2, to2);
      await copyFile(from2, to2);
    }
  }

  for (const file of FILES_TO_COPY) {
    const from = join(source, file);
    const to = join(target, file);

    logFileOp(COPY, from, to);
    await copyFile(from, to);
  }

  // ===== Styles =====

  console.error(TOOL);
  for (const file of STYLES) {
    const from = join(source, file);
    const to = join(target, file);

    logFileOp(STYLE, from, to);
    const input = await readFile(from);
    const output = await postcss.process(input, { from, to });
    output.warnings().forEach(warn => {
      process.stderr.write(warn.toString())
    })

    await writeFile(to, output.css);
  }

  // ===== Scripts =====

  for (const file of SCRIPTS) {
    const from = join(source, file);
    const to = join(target, file);

    logFileOp(COPY, from, to);
    await copyFile(from, to);
  }
}

process.chdir(resolve(__dirname, '..'));
build();
