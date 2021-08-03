/* ========================================================================== *
 * (C) Copyright 2019-2021 Robert Grimm, released under the MIT license.
 * ========================================================================== */

let DEBUG = false;

function createFooterWithReferences() {
  // >>> (1) Read from DOM: Check footer, determine options, extract links.
  const article = document.querySelector('main > article');

  if (!article || article.querySelector('footer.references')) {
    if (DEBUG) console.log(`❌ No article requiring footer with references`);
    return;
  }

  let options = {};
  const { url } = import.meta;
  const { pathname } = new URL(url);
  const { scripts } = document;
  for (let index = 0; index < scripts.length; index++) {
    const script = scripts[index];
    const { src } = script;
    if (src === url || src === pathname) {
      options = script.dataset;
      break;
    }
  }

  const hyperlinks = article.querySelectorAll('a[href]');

  // >>> (2) Prepare changes to DOM: Create footer with references.
  const footer = document.createElement('footer');
  footer.className = 'references';

  const h2 = document.createElement('h2');
  if (options.referenceFooterClass) h2.className = options.referenceFooterClass;
  h2.innerText = 'References';
  footer.appendChild(h2);

  const ol = document.createElement('ol');
  ol.className = 'counted';
  footer.appendChild(ol);

  let count = 0;
  for (const { href } of hyperlinks) {
    if (!href.startsWith('https://apparebit.com/')) {
      const link = document.createElement('a');
      link.href = href;
      link.innerText = href;

      const li = document.createElement('li');
      li.appendChild(link);
      ol.appendChild(li);
      count++;
    }
  }

  // >>> (3) Write to DOM: Add newly created footer to article.
  article.appendChild(footer);

  if (DEBUG) {
    const total = hyperlinks.length;
    console.log(`✅ Created footer with ${count}/${total} references`);
  }
}

// -----------------------------------------------------------------------------

function updateThemeColor() {
  const metaElements =
    Array.from(document.querySelectorAll('meta[name=theme-color]'));
  if (!metaElements.some(element => element.dataset.fallback)) {
    if (DEBUG) console.log(`❌ No <meta name=theme-color> with fallback`);
    return;
  }

  let hero = document.querySelector('.cover img');
  if (!hero) {
    if (DEBUG) console.log(`❌ No hero .cover requiring theme-color change`);
    return;
  }

  const themes = metaElements.map(element => {
    const original = element.content;
    const fallback = element.dataset.fallback ?? original;
    return { element, original, fallback };
  });

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const { isIntersecting } = entry;
      for (const theme of themes) {
        theme.element.content = isIntersecting ? theme.original : theme.fallback;
      }
    }
  });
  observer.observe(hero);

  if (DEBUG) {
    const { length } = themes;
    console.log(`✅ Enabled color switching for ${length} theme-colors`);
  }
}

// -----------------------------------------------------------------------------

function setup() {
  // Safari doesn't support beforeprint event, so media query serves as fallback.
  // https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeprint
  if (document.body.classList.contains('print-references')) {
    window.addEventListener('beforeprint', createFooterWithReferences);
    window.matchMedia('print').addListener(event => {
      if (event.matches) {
        createFooterWithReferences();
      }
    });
  }

  updateThemeColor();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setup);
} else {
  setup();
}
