/* ========================================================================== *
 * (C) Copyright 2019 Robert Grimm, released under the MIT license.
 * ========================================================================== */
'use strict';

const { max, round } = Math;
const options = document.currentScript.dataset;

function addReferencesFooter() {
  // >>> Phase 1: READ from DOM. If references don't exist, extract links.
  const article = document.querySelector('main > article');
  if (!article || article.querySelector('footer.references')) return;
  const hyperlinks = article.querySelectorAll('a[href]');

  // >>> Phase 2: WRITE to DOM. Create mark-up for footer with references.
  const footer = document.createElement('footer');
  footer.classList.add('references');

  const h2 = document.createElement('h2');
  h2.innerText = 'References';
  if (options.h2) h2.className = options.h2;
  const div = document.createElement('div');
  div.classList.add('heading');
  div.appendChild(h2);
  footer.appendChild(div);

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

  /* Add footer to article. */
  article.appendChild(footer);
}

/* Only add references iff the body has class `print-references`. */
if (document.body.classList.contains('print-references')) {
  window.onbeforeprint = addReferencesFooter;
  const queries = window.matchMedia('print');
  queries.addListener(mql => {
    if (mql.matches) {
      addReferencesFooter();
    }
  });
}
