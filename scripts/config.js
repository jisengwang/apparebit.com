'use strict';

const { join, resolve } = require('path');
const ROOT = resolve(__dirname, '..');

module.exports = {
  ROOT,
  CONFIG_FILES: join(ROOT, 'config'),
  SOURCE_ROOT: join(ROOT, 'content'),
  TARGET_ROOT: join(ROOT, 'build'),
  DIRECTORIES_TO_COPY: [
    'about',
    'assets/fonts',
    'assets/icons',
    'assets/images',
    'features/do-you-be',
    'features/ubu-trump',
  ],
  FILES_TO_COPY: [
    '.htaccess',
    '403.html',
    '404.html',
    'index.html',
    'robots.txt',
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
