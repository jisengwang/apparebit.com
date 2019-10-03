/* ========================================================================== *
 * (C) Copyright 2019 Robert Grimm, released under the MIT license.
 * ========================================================================== */
'use strict';

const { max, round } = Math;
const options = document.currentScript.dataset;

function addReferencesFooter() {
  /* Only add references if article doesn't already have a footer with them. */
  const article = document.querySelector('main > article');
  if (!article || article.querySelector('footer.references')) return;

  /* Create the new footer containing the references. */
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

  const { origin } = window;
  const hyperlinks = article.querySelectorAll('a[href]');
  for (const href of hyperlinks) {
    if (!href.startsWith(origin)) {
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
