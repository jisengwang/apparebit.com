/* (C) Copyright 2019-2024 Robert Grimm
   Licensed under the MIT License (https://opensource.org/licenses/MIT) */

const DEBUG = Boolean(
  document.documentElement.classList.contains('debug')
  || document.body.classList.contains('debug')
);
if (DEBUG) console.log(`☑️ Preparing dynamic page enhancements.`);

// -----------------------------------------------------------------------------

function createFooterWithReferences() {
  // >>> (1) Read from DOM: Check footer, determine options, extract links.
  const article = document.querySelector('main > article');

  if (!article || article.querySelector('footer.references')) {
    if (DEBUG) console.log(`☑️ No need for (re)creating printed references.`);
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
    console.log(`✅ Created footer with ${count}/${total} references.`);
  }
}

// -----------------------------------------------------------------------------

function updateThemeColor() {
  // Extract <meta name="theme-color"> elements with data-fallback attribute.
  // There might be two, one for light mode and one for dark mode.
  const themes = []
  for (const element of document.querySelectorAll('meta[name=theme-color]')) {
    if (element.dataset.fallback) {
      const visible = element.content;
      const invisible = element.dataset.fallback;
      themes.push({ element, visible, invisible })
    }
  }
  if (themes.length === 0) {
    if (DEBUG) console.log(`☑️ No <meta name=theme-color> with fallback.`);
    return;
  }

  // Extract element whose visibility will control theme color.
  let header = document.querySelector('.cover img');
  if (!header) header = document.querySelector('.page-header');
  if (!header) {
    if (DEBUG) console.error(`❌ No header element to control theme color switching!`);
    return;
  }

  // Set up intersection observer to update <meta content> attribute. Update
  // *all*, so that we don't need to monitor light/dark mode changes, too.
  const updateThemes = isVisible => {
    if (DEBUG) {
      console.log(`❇️ Activating ${isVisible ? 'above' : 'below'} fold theme colors.`);
    }
    for (const theme of themes) {
      theme.element.content = isVisible ? theme.visible : theme.invisible;
    }
  };
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      updateThemes(entry.isIntersecting);
    }
  });
  observer.observe(header);

  // Et voila!
  if (DEBUG) {
    const elements = `${themes.length} theme${themes.length === 1 ? '' : 's'}`;
    console.log(`✅ Enabled color switching for ${elements}.`);
  }
}

// -----------------------------------------------------------------------------

function setup() {
  if (DEBUG) {
    console.log(`☑️ Configuring dynamic page enhancements after content loaded.`);
  }

  // Safari doesn't support beforeprint event, so media query serves as fallback.
  // https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeprint
  if (document.body.classList.contains('print-references')) {
    if (DEBUG) console.log(`☑️ Page requests printed references.`);
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
