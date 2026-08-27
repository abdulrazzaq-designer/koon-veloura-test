/* ========================================================================
   Veloura V75
   - Synchronize side-menu glass class.
   - Restore mmenu root panel after opening.
   - Force every Salla search host/shadow to the dark secondary color.
   ======================================================================== */

const SEARCH_STYLE_ID = 'veloura-search-secondary-v75';
const observedRoots = new WeakSet();
const queuedHosts = new WeakSet();

function darkMode() {
  return (
    document.documentElement.classList.contains('dark') ||
    document.body?.classList.contains('dark') ||
    document.documentElement.getAttribute('data-theme') === 'dark'
  );
}

function important(element, name, value) {
  element?.style?.setProperty(name, value, 'important');
}

function cssValue(name, fallback) {
  const rootStyle = getComputedStyle(document.documentElement);
  const bodyStyle = document.body ? getComputedStyle(document.body) : null;

  return (
    rootStyle.getPropertyValue(name).trim() ||
    bodyStyle?.getPropertyValue(name).trim() ||
    fallback
  );
}

function syncSideGlassClass() {
  const html = document.documentElement;
  const body = document.body;
  if (!body) return;

  const settings = window.velouraSideCategoriesSettings || {};
  const enabled =
    settings.glass === true ||
    settings.glass === 'true' ||
    html.classList.contains('veloura-side-cats-glass') ||
    body.classList.contains('veloura-side-cats-glass');

  html.classList.toggle('veloura-side-cats-glass', enabled);
  body.classList.toggle('veloura-side-cats-glass', enabled);
}

function restoreMenuPanels() {
  syncSideGlassClass();

  const drawer = document.querySelector('.mm-ocd.mm-ocd--open');
  if (!drawer) return;

  const menu = drawer.querySelector('#mobile-menu.mm-spn');
  if (!menu) return;

  important(menu, 'display', 'block');
  important(menu, 'visibility', 'visible');
  important(menu, 'opacity', '1');

  const textColor = cssValue(
    '--veloura-dark-side-menu-text',
    cssValue('--veloura-side-cats-text', '#ffffff')
  );

  important(menu, 'color', textColor);

  if (menu.classList.contains('mm-spn--main')) {
    const rootList = menu.querySelector(':scope > ul.main-menu');
    if (rootList) {
      important(rootList, 'display', 'block');
      important(rootList, 'visibility', 'visible');
      important(rootList, 'opacity', '1');
      important(rootList, 'transform', 'none');
    }
  }

  menu.querySelectorAll('li > a, li > span').forEach((element) => {
    important(element, 'visibility', 'visible');
    important(element, 'opacity', '1');
    important(element, 'color', textColor);
    important(element, '-webkit-text-fill-color', textColor);
  });
}

const SEARCH_STYLE = `
  :host {
    --s-search-input-bg: transparent !important;
    --s-search-input-background: transparent !important;
    --search-input-bg: transparent !important;
    --search-background: transparent !important;
  }

  :host([data-veloura-inline='true']),
  :host([data-veloura-inline='true']) form,
  :host([data-veloura-inline='true']) input,
  :host([data-veloura-inline='true']) .s-search-input,
  :host([data-veloura-inline='true']) .s-search-container,
  :host([data-veloura-inline='true']) .s-search-wrapper,
  :host([data-veloura-inline='true']) [part~='input'],
  :host([data-veloura-inline='true']) [part~='form'],
  :host([data-veloura-inline='true']) [part~='container'] {
    background: transparent !important;
    background-color: transparent !important;
    background-image: none !important;
    border-color: transparent !important;
    box-shadow: none !important;
  }

  :host([data-veloura-dark='true']) {
    --s-search-bg: var(--veloura-dark-secondary-bg, #010612) !important;
    --s-search-modal-bg: var(--veloura-dark-secondary-bg, #010612) !important;
    --s-modal-bg: var(--veloura-dark-secondary-bg, #010612) !important;
    --color-grey: var(--veloura-dark-secondary-bg, #010612) !important;
    --color-grey-light: var(--veloura-dark-secondary-bg, #010612) !important;
    --color-grey-lighter: var(--veloura-dark-secondary-bg, #010612) !important;
    color: var(--veloura-dark-primary-text, #ffffff) !important;
  }

  :host([data-veloura-dark='true'][data-veloura-inline='false']) form,
  :host([data-veloura-dark='true'][data-veloura-inline='false']) input,
  :host([data-veloura-dark='true'][data-veloura-inline='false'])
    .s-search-input,
  :host([data-veloura-dark='true']) .s-search-results,
  :host([data-veloura-dark='true']) .s-search-results-wrapper,
  :host([data-veloura-dark='true']) .s-search-result,
  :host([data-veloura-dark='true']) .s-search-result-item,
  :host([data-veloura-dark='true']) [part~='results'],
  :host([data-veloura-dark='true']) [part~='panel'] {
    background: var(--veloura-dark-secondary-bg, #010612) !important;
    background-color: var(--veloura-dark-secondary-bg, #010612) !important;
    color: var(--veloura-dark-primary-text, #ffffff) !important;
    border-color: transparent !important;
  }
`;

function isInlineSearch(host) {
  return (
    host.classList.contains('veloura-header-search-component') ||
    Boolean(host.closest('.veloura-search-surface'))
  );
}

function ensureStyle(root) {
  let style = root.querySelector(`style[data-${SEARCH_STYLE_ID}]`);

  if (!style) {
    style = document.createElement('style');
    style.setAttribute(`data-${SEARCH_STYLE_ID}`, 'true');
    root.appendChild(style);
  }

  if (style.textContent !== SEARCH_STYLE) {
    style.textContent = SEARCH_STYLE;
  }
}

function paintSearch(host) {
  if (!host) return;

  const dark = darkMode();
  const inline = isInlineSearch(host);
  const secondary = cssValue('--veloura-dark-secondary-bg', '#010612');
  const primaryText = cssValue('--veloura-dark-primary-text', '#ffffff');

  host.setAttribute('data-veloura-dark', dark ? 'true' : 'false');
  host.setAttribute('data-veloura-inline', inline ? 'true' : 'false');

  if (dark) {
    [
      '--s-search-bg',
      '--s-search-modal-bg',
      '--s-modal-bg',
      '--color-grey',
      '--color-grey-light',
      '--color-grey-lighter',
    ].forEach((name) => important(host, name, secondary));

    important(host, 'color', primaryText);
  }

  if (inline) {
    important(host, '--s-search-input-bg', 'transparent');
    important(host, '--s-search-input-background', 'transparent');
    important(host, '--search-input-bg', 'transparent');
    important(host, 'background', 'transparent');
    important(host, 'background-color', 'transparent');
  } else if (dark) {
    important(host, 'background', secondary);
    important(host, 'background-color', secondary);
  }

  const root = host.shadowRoot;
  if (!root) return;

  ensureStyle(root);

  root.querySelectorAll(`
    form,
    input,
    .s-search-input,
    .s-search-container,
    .s-search-wrapper,
    [part~='input'],
    [part~='form'],
    [part~='container']
  `).forEach((element) => {
    important(element, 'color', primaryText);
    important(element, 'border-color', 'transparent');
    important(element, 'box-shadow', 'none');

    if (inline) {
      important(element, 'background', 'transparent');
      important(element, 'background-color', 'transparent');
      important(element, 'background-image', 'none');
    } else if (dark) {
      important(element, 'background', secondary);
      important(element, 'background-color', secondary);
    }
  });

  if (dark) {
    root.querySelectorAll(`
      .s-search-results,
      .s-search-results-wrapper,
      .s-search-result,
      .s-search-result-item,
      [part~='results'],
      [part~='panel']
    `).forEach((element) => {
      important(element, 'background', secondary);
      important(element, 'background-color', secondary);
      important(element, 'color', primaryText);
    });
  }

  if (!observedRoots.has(root)) {
    const observer = new MutationObserver(() => queueSearch(host));
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });
    observedRoots.add(root);
  }
}

function queueSearch(host) {
  if (!host || queuedHosts.has(host)) return;
  queuedHosts.add(host);

  requestAnimationFrame(() => {
    queuedHosts.delete(host);
    paintSearch(host);
  });
}

function watchSearch(host) {
  queueSearch(host);

  if (typeof host.componentOnReady === 'function') {
    host.componentOnReady().then(() => paintSearch(host)).catch(() => {});
  }
}

function scan(scope = document) {
  if (scope.matches?.('salla-search')) watchSearch(scope);
  scope.querySelectorAll?.('salla-search').forEach(watchSearch);
}

function syncAll() {
  syncSideGlassClass();
  restoreMenuPanels();
  document.querySelectorAll('salla-search').forEach(watchSearch);
}

function start() {
  syncAll();

  const observer = new MutationObserver((records) => {
    syncSideGlassClass();
    restoreMenuPanels();

    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node instanceof Element) scan(node);
      }
    }
  });

  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  const themeObserver = new MutationObserver(syncAll);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-theme'],
  });

  if (document.body) {
    themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });
  }

  window.addEventListener('veloura:theme-changed', syncAll);
  document.addEventListener('theme::ready', syncAll);

  [100, 350, 800, 1600, 3200].forEach((delay) => {
    window.setTimeout(syncAll, delay);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}

export default syncAll;
