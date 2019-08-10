#!/usr/bin/env node
'use strict';

const {
  copyFile, mkdir, readdir, readFile, writeFile
} = require('fs').promises;
const { promisify } = require('util');
const { resolve } = require('path');
const rimraf = promisify(require('rimraf'));

const postcss = require('postcss')([
  require('cssnano')({
    preset: ['default', {
      svgo: false,
    }],
  }),
]);

const CONTENT_PATH = 'content';
const BUILD_PATH = 'build';

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

const MODULES = [
  'assets/function.js',
]

async function build() {
  await rimraf(BUILD_PATH);
  await mkdir(BUILD_PATH);

  for (const dir of DIRECTORIES_TO_COPY) {
    const from = resolve(CONTENT_PATH, dir);
    const to = resolve(BUILD_PATH, dir);

    const entries = await readdir(from, { withFileTypes: true });
    await mkdir(to, { recursive: true });

    for (const entry of entries) {
      if (!entry.isFile()) continue;

      await copyFile(resolve(from, entry.name), resolve(to, entry.name));
    }
  }

  for (const file of FILES_TO_COPY) {
    const from = resolve(CONTENT_PATH, file);
    const to = resolve(BUILD_PATH, file);

    await copyFile(from, to);
  }

  for (const file of STYLES) {
    const from = resolve(CONTENT_PATH, file);
    const to = resolve(BUILD_PATH, file);

    const input = await readFile(from);
    const output = await postcss.process(input, { from, to });
    output.warnings().forEach(warn => {
      process.stderr.write(warn.toString())
    })

    await writeFile(to, output.css);
  }

  for (const file of MODULES) {
    const from = resolve(CONTENT_PATH, file);
    const to = resolve(BUILD_PATH, file);

    await copyFile(from, to);
  }
}

process.chdir(resolve(__dirname, '..'));
build();
