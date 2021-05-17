/* ========================================================================== *
 * (C) Copyright 2019 Robert Grimm, released under the MIT license.
 * ========================================================================== */
'use strict';

const DEBUG = false;

(function main(window, document) {
  const options = document.currentScript.dataset;

  function createFooterWithReferences() {
    if (DEBUG) console.log('called createFooterWithReferences()');

    // >>> (1) Read from DOM: If footer doesn't exist, extract all links.
    const article = document.querySelector('main > article');
    if (!article || article.querySelector('footer.references')) return;
    const hyperlinks = article.querySelectorAll('a[href]');

    if (DEBUG) {
      console.log(`processing ${hyperlinks.length} references`);
    }

    // >>> (2) Create DOM: Build up footer with references.
    const footer = document.createElement('footer');
    footer.className = 'references';

    const h2 = document.createElement('h2');
    if (options.h2) h2.className = options.h2;
    h2.innerText = 'References';
    footer.appendChild(h2);

    const ol = document.createElement('ol');
    footer.appendChild(ol);

    for (const { href } of hyperlinks) {
      if (!href.startsWith('https://apparebit.com/')) {
        const link = document.createElement('a');
        link.href = href;
        link.innerText = href;

        const li = document.createElement('li');
        li.appendChild(link);
        ol.appendChild(li);
      }
    }

    // >>> (3) Write to DOM: Add footer to article.
    article.appendChild(footer);
  }

  // Once the DOM has loaded, wire up event handlers.
  function wireUp() {
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireUp);
  } else {
    wireUp();
  }

  // A class on :root for light/dark mode much simplifies their styles!
  // As an added bonus, :root is created early on during parsing.
  if (window.matchMedia) {
    const classList = document.documentElement.classList;
    const setColorScheme = isDark => {
      if (isDark) {
        classList.add('dark');
        classList.remove('light');
      } else {
        classList.add('light');
        classList.remove('dark');
      }
    };
    const query = window.matchMedia('(prefers-color-scheme:dark)');
    query.addListener(event => setColorScheme(event.matches));
    setColorScheme(query.matches);
  }
})(window, document);
