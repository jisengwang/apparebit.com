/* (C) Copyright 2019 Robert Grimm. Released under MIT license. */
'use strict';

const { join, resolve } = require('path');
const ROOT = resolve(__dirname, '..');

module.exports = {
  ROOT,
  CONFIG_ROOT: join(ROOT, 'config'),
  SOURCE_ROOT: join(ROOT, 'content'),
  TARGET_ROOT: join(ROOT, 'build'),
  CONTENT_DIRECTORIES_TO_COPY: [
    'about',
    'assets/fonts',
    'assets/icons',
    'assets/images',
    'features/do-you-be',
    'features/ubu-trump',
  ],
  CONTENT_FILES_TO_COPY: [
    '403.html',
    '404.html',
    'index.html',
    'robots.txt',
    'assets/apparebit.webmanifest',
  ],
  CONFIG_FILES_TO_COPY: [
    '.htaccess',
    'aarrh6dhlwkj38ie8h9y1pmlzg3gyz.html',
    'googlee753ef1b651640a9.html',
  ],
  MARKUP: [
    '403.html',
    '404.html',
    'index.html',
    'about/apparebit.html',
    'about/privacy.html',
    'features/do-you-be/index.html',
    'features/ubu-trump/index.html',
  ],
  STYLES: [
    'assets/form.css',
  ],
  SCRIPTS: [
    'assets/function.js',
  ],
};
